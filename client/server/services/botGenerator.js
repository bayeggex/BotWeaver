import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateBotCode(botConfig, outputDir) {
  // Validate botConfig
  if (!botConfig || typeof botConfig !== 'object') {
    throw new Error('Invalid bot configuration');
  }

  // Ensure required fields are strings
  botConfig.name = String(botConfig.name || 'Unnamed Bot');
  botConfig.description = String(botConfig.description || '');
  botConfig.token = String(botConfig.token || '');
  botConfig.prefix = String(botConfig.prefix || '!');
  botConfig.status = String(botConfig.status || 'online');
  
  // Add slash commands setting (default true for backward compatibility)
  if (botConfig.useSlashCommands === undefined) {
    botConfig.useSlashCommands = true;
  }

  // Ensure commands is an array
  if (!Array.isArray(botConfig.commands)) {
    botConfig.commands = [];
  }

  // Validate each command
  botConfig.commands = botConfig.commands.map(cmd => ({
    ...cmd,
    name: String(cmd.name || 'unnamed'),
    description: String(cmd.description || ''),
    response: String(cmd.response || 'No response'),
    type: String(cmd.type || 'text')
  }));

  // Generate package.json for the bot
  const packageJson = {
    name: botConfig.name.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    description: `Discord bot created with Discord Bot Builder`,
    main: 'index.js',
    type: 'module',
    scripts: {
      start: 'node index.js',
      dev: 'nodemon index.js'
    },
    dependencies: {
      'discord.js': '^14.16.1',
      'dotenv': '^16.4.5'
    },
    devDependencies: {
      'nodemon': '^3.0.2'
    }
  };

  // Generate main bot file
  const botCode = generateMainBotCode(botConfig);

  // Generate .env file
  const envContent = `# Discord Bot Token\nDISCORD_TOKEN=${botConfig.token || 'YOUR_BOT_TOKEN_HERE'}\n`;

  // Generate README.md
  const readmeContent = generateReadme(botConfig);

  // Generate Docker files
  const dockerfile = generateDockerfile();
  const dockerCompose = generateDockerCompose(botConfig.name);

  // Generate install scripts
  const installBat = generateInstallBat();
  const installSh = generateInstallSh();

  // Write all files
  await fs.writeFile(path.join(outputDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  await fs.writeFile(path.join(outputDir, 'index.js'), botCode);
  await fs.writeFile(path.join(outputDir, '.env'), envContent);
  await fs.writeFile(path.join(outputDir, 'README.md'), readmeContent);
  await fs.writeFile(path.join(outputDir, 'Dockerfile'), dockerfile);
  await fs.writeFile(path.join(outputDir, 'docker-compose.yml'), dockerCompose);
  await fs.writeFile(path.join(outputDir, 'install.bat'), installBat);
  await fs.writeFile(path.join(outputDir, 'install.sh'), installSh);
}

function generateMainBotCode(botConfig) {
  const intents = [
    'GatewayIntentBits.Guilds',
    'GatewayIntentBits.GuildMessages',
    'GatewayIntentBits.MessageContent'
  ];

  // Add additional intents based on features used
  const needsGuildMembers = botConfig.commands.some(cmd => 
    cmd.type === 'role' || cmd.parameters?.some(p => p.type === 'user')
  );
  if (needsGuildMembers) {
    intents.push('GatewayIntentBits.GuildMembers');
  }

  const needsReactions = botConfig.commands.some(cmd => cmd.type === 'reaction');
  if (needsReactions) {
    intents.push('GatewayIntentBits.GuildMessageReactions');
  }

  return `import { 
  Client, 
  GatewayIntentBits, 
  SlashCommandBuilder, 
  REST, 
  Routes,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionFlagsBits,
  ActivityType
} from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    ${intents.join(',\n    ')},
  ],
});

// Bot configuration
const BOT_CONFIG = ${JSON.stringify(botConfig, null, 2)};

// Cooldown tracking
const cooldowns = new Map();

// Commands array for slash command registration
const commands = [
${botConfig.commands.map(cmd => {
  const slashCommand = `new SlashCommandBuilder()
    .setName('${cmd.name}')
    .setDescription('${cmd.description || cmd.response || 'Bot command'}')`;
  
  if (cmd.parameters && cmd.parameters.length > 0) {
    const parameterCode = cmd.parameters.map(param => {
      const typeMap = {
        string: 'addStringOption',
        integer: 'addIntegerOption',
        user: 'addUserOption',
        channel: 'addChannelOption',
        role: 'addRoleOption',
        boolean: 'addBooleanOption'
      };
      
      const optionMethod = typeMap[param.type] || 'addStringOption';
      return `    .${optionMethod}(option =>
        option.setName('${param.name}')
              .setDescription('${param.description || param.name}')
              .setRequired(${param.required || false})
    )`;
    }).join('\n');
    
    return slashCommand + '\n' + parameterCode;
  }
  
  return slashCommand;
}).join(',\n')},
];

// Permission check function
function hasPermission(member, requiredPermissions) {
  if (!requiredPermissions || requiredPermissions.length === 0) return true;
  
  // Check if user has any of the allowed roles
  if (BOT_CONFIG.allowedRoles) {
    const allowedRoles = BOT_CONFIG.allowedRoles.split(',').map(r => r.trim());
    if (member.roles.cache.some(role => allowedRoles.includes(role.id) || allowedRoles.includes(role.name))) {
      return true;
    }
  }
  
  // Check Discord permissions
  return requiredPermissions.every(permission => {
    return member.permissions.has(PermissionFlagsBits[permission]);
  });
}

// Cooldown check function
function checkCooldown(userId, commandName, cooldownTime) {
  if (cooldownTime <= 0) return false;
  
  const key = \`\${userId}-\${commandName}\`;
  const now = Date.now();
  const cooldownEnd = cooldowns.get(key);
  
  if (cooldownEnd && now < cooldownEnd) {
    return Math.ceil((cooldownEnd - now) / 1000);
  }
  
  cooldowns.set(key, now + (cooldownTime * 1000));
  return false;
}

// Register slash commands
async function registerCommands() {
  try {
    // Only register slash commands if user wants them
    if (BOT_CONFIG.useSlashCommands === false) {
      console.log('Slash commands disabled, skipping registration.');
      return;
    }
    
    console.log('Started refreshing application (/) commands.');
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );
    
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

// Command execution handlers
async function executeCommand(interaction, command) {
  try {
    // Check permissions
    if (command.permissions && !hasPermission(interaction.member, command.permissions)) {
      return await interaction.reply({
        content: '❌ You do not have sufficient permissions to use this command!',
        ephemeral: true
      });
    }
    
    // Check cooldown
    if (command.cooldown > 0) {
      const remainingCooldown = checkCooldown(interaction.user.id, command.name, command.cooldown);
      if (remainingCooldown) {
        return await interaction.reply({
          content: \`⏱️ Please wait \${remainingCooldown} seconds before using this command again.\`,
          ephemeral: true
        });
      }
    }
    
    // Execute based on command type
    switch (command.type) {
      case 'text':
        await interaction.reply({
          content: command.response,
          ephemeral: command.ephemeral || false
        });
        break;
        
      case 'embed':
        const embed = new EmbedBuilder()
          .setTitle(command.embedTitle || null)
          .setDescription(command.embedDescription || null)
          .setColor(command.embedColor || '#5865F2');
          
        if (command.embedFields) {
          command.embedFields.forEach(field => {
            if (field.name && field.value) {
              embed.addFields({
                name: field.name,
                value: field.value,
                inline: field.inline || false
              });
            }
          });
        }
        
        await interaction.reply({
          embeds: [embed],
          ephemeral: command.ephemeral || false
        });
        break;
        
      case 'reaction':
        const reactionMessage = await interaction.reply({
          content: command.response || 'Reaction message',
          ephemeral: command.ephemeral || false,
          fetchReply: true
        });
        
        if (command.reactions) {
          const reactions = command.reactions.split(',').map(r => r.trim());
          for (const reaction of reactions) {
            try {
              await reactionMessage.react(reaction);
            } catch (err) {
              console.error(\`Failed to add reaction \${reaction}:\`, err);
            }
          }
        }
        break;
        
      case 'role':
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(targetUser.id);
        const roleName = command.roleTarget;
        
        let targetRole = interaction.guild.roles.cache.find(role => 
          role.name === roleName || role.id === roleName
        );
        
        if (!targetRole) {
          return await interaction.reply({
            content: \`❌ Role "\${roleName}" not found!\`,
            ephemeral: true
          });
        }
        
        try {
          switch (command.roleAction) {
            case 'add':
              await member.roles.add(targetRole);
              break;
            case 'remove':
              await member.roles.remove(targetRole);
              break;
            case 'toggle':
              if (member.roles.cache.has(targetRole.id)) {
                await member.roles.remove(targetRole);
              } else {
                await member.roles.add(targetRole);
              }
              break;
          }
          
          await interaction.reply({
            content: command.roleSuccessMessage || \`✅ Role operation successful!\`,
            ephemeral: command.ephemeral || false
          });
        } catch (error) {
          await interaction.reply({
            content: '❌ Role operation failed! Check bot permissions.',
            ephemeral: true
          });
        }
        break;
        
      case 'button':
        const buttonRow = new ActionRowBuilder();
        const buttonLabels = command.buttonLabels ? command.buttonLabels.split(',') : ['Buton 1'];
        
        buttonLabels.forEach((label, index) => {
          buttonRow.addComponents(
            new ButtonBuilder()
              .setCustomId(\`btn_\${command.name}_\${index}\`)
              .setLabel(label.trim())
              .setStyle(ButtonStyle.Primary)
          );
        });
        
        await interaction.reply({
          content: command.response || 'Choose an option:',
          components: [buttonRow],
          ephemeral: command.ephemeral || false
        });
        break;
        
      default:
        await interaction.reply({
          content: command.response || 'Command response',
          ephemeral: command.ephemeral || false
        });
    }
    
    // Log command usage if enabled
    if (BOT_CONFIG.logCommands) {
      console.log(\`Command used: \${command.name} by \${interaction.user.tag} in \${interaction.guild?.name || 'DM'}\`);
    }
    
  } catch (error) {
    console.error('Error executing command:', error);
    
    const errorMessage = 'An error occurred while executing the command!';
    
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    } catch (replyError) {
      console.error('Error sending error message:', replyError);
    }
    
    // Send error to error channel if configured
    if (BOT_CONFIG.errorChannelId) {
      const errorChannel = client.channels.cache.get(BOT_CONFIG.errorChannelId);
      if (errorChannel) {
        errorChannel.send(\`❌ **Error:** \${command.name} command\n\\\`\\\`\\\`\n\${error.stack}\n\\\`\\\`\\\`\`);
      }
    }
  }
}

// Bot ready event
client.once('ready', async () => {
  console.log(\`✅ \${client.user.tag} is online!\`);
  console.log(\`🎯 Bot Name: \${BOT_CONFIG.name}\`);
  console.log(\`📊 Servers: \${client.guilds.cache.size}\`);
  console.log(\`👥 Users: \${client.users.cache.size}\`);
  
  // Set bot activity
  if (BOT_CONFIG.activity && BOT_CONFIG.activity.name) {
    const activityTypes = {
      PLAYING: ActivityType.Playing,
      STREAMING: ActivityType.Streaming,
      LISTENING: ActivityType.Listening,
      WATCHING: ActivityType.Watching,
      COMPETING: ActivityType.Competing
    };
    
    client.user.setActivity(BOT_CONFIG.activity.name, {
      type: activityTypes[BOT_CONFIG.activity.type] || ActivityType.Playing,
      url: BOT_CONFIG.activity.url || undefined
    });
  }
  
  // Set bot status
  if (BOT_CONFIG.status) {
    client.user.setStatus(BOT_CONFIG.status);
  }
  
  // Register commands when bot is ready
  await registerCommands();
});

// Slash command interaction handler
client.on('interactionCreate', async (interaction) => {
  // Skip if slash commands are disabled
  if (BOT_CONFIG.useSlashCommands === false) return;
  
  if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

  // Check if bot is allowed in this channel
  if (BOT_CONFIG.allowedChannels && !BOT_CONFIG.allowedChannels.includes(interaction.channelId)) {
    return;
  }

  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;
    const command = BOT_CONFIG.commands.find(cmd => cmd.name === commandName);
    
    if (command) {
      await executeCommand(interaction, command);
    }
  } else if (interaction.isButton()) {
    // Handle button interactions
    const customId = interaction.customId;
    if (customId.startsWith('btn_')) {
      const [, commandName, buttonIndex] = customId.split('_');
      const command = BOT_CONFIG.commands.find(cmd => cmd.name === commandName);
      
      if (command && command.buttonLabels) {
        const buttonLabels = command.buttonLabels.split(',');
        const selectedLabel = buttonLabels[parseInt(buttonIndex)];
        
        await interaction.reply({
          content: \`✅ You selected "\${selectedLabel?.trim()}"!\`,
          ephemeral: true
        });
      }
    }
  }
});

// Message handler for prefix commands (optional)
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  // Check DM commands setting
  if (!message.guild && !BOT_CONFIG.dmCommands) return;
  
  // Check allowed channels
  if (message.guild && BOT_CONFIG.allowedChannels && !BOT_CONFIG.allowedChannels.includes(message.channelId)) {
    return;
  }
  
  const prefix = BOT_CONFIG.prefix || '!';
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Find command
  const command = BOT_CONFIG.commands.find(cmd => cmd.name === commandName);
  
  if (command) {
    try {
      // Check permissions for prefix commands
      if (command.permissions && message.guild && !hasPermission(message.member, command.permissions)) {
        return message.reply('❌ You do not have sufficient permissions to use this command!');
      }
      
      // Check cooldown
      if (command.cooldown > 0) {
        const remainingCooldown = checkCooldown(message.author.id, command.name, command.cooldown);
        if (remainingCooldown) {
          return message.reply(\`⏱️ Please wait \${remainingCooldown} seconds before using this command again.\`);
        }
      }
      
      // Simple text response for prefix commands
      if (command.type === 'text' || !command.type) {
        await message.reply(command.response);
      } else {
        await message.reply('This command can only be used as a slash command (/).');
      }
      
      // Delete command message if enabled
      if (BOT_CONFIG.deleteCommands && message.guild) {
        try {
          await message.delete();
        } catch (err) {
          // Ignore deletion errors
        }
      }
      
    } catch (error) {
      console.error('Error executing prefix command:', error);
      message.reply('An error occurred while executing the command!');
    }
  }
});

// Error handling
client.on('error', console.error);

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);`;
}

function generateReadme(botConfig) {
  const commandList = botConfig.commands.map(cmd => {
    let description = `- **/${cmd.name}**: ${cmd.description || 'Bot command'}`;
    
    if (cmd.type && cmd.type !== 'text') {
      description += ` *(${cmd.type})*`;
    }
    
    if (cmd.parameters && cmd.parameters.length > 0) {
      const params = cmd.parameters.map(p => `${p.name}${p.required ? '*' : ''}`).join(', ');
      description += `\n  - Parametreler: ${params}`;
    }
    
    if (cmd.permissions && cmd.permissions.length > 0) {
      description += `\n  - Gerekli izinler: ${cmd.permissions.join(', ')}`;
    }
    
    if (cmd.cooldown > 0) {
      description += `\n  - Cooldown: ${cmd.cooldown} saniye`;
    }
    
    return description;
  }).join('\n');

  return `# ${botConfig.name}

${botConfig.description || 'This bot was created with Discord Bot Builder.'}

## 🚀 Quick Setup

### ⚡ Automatic Installation (Recommended)

**Windows:**
\`\`\`bash
# 1. Right-click in folder > "Open in Terminal" or open PowerShell
# 2. Run this command:
.\\install.bat
\`\`\`

**Linux/Mac:**
\`\`\`bash
# 1. Open terminal and navigate to bot folder
# 2. Run this command:
chmod +x install.sh && ./install.sh
\`\`\`

### 📋 Manual Installation

**1. Check Node.js**
First, check if Node.js is installed:
\`\`\`bash
node --version
# Should be v18.0.0 or higher
\`\`\`

**2. Install Dependencies**
\`\`\`bash
npm install
\`\`\`

**3. Set Your Bot Token**
Open the \`.env\` file and paste your bot token:
\`\`\`env
DISCORD_TOKEN=your_bot_token_here
\`\`\`

**4. Start the Bot**
\`\`\`bash
npm start
\`\`\`

## 🐳 Running with Docker (Optional)

\`\`\`bash
# Start with one command
docker-compose up -d

# To stop
docker-compose down
\`\`\`

## 📋 Bot Commands

${commandList}

## ⚙️ Features

### Command Types
- **Text**: Simple text responses
- **Embed**: Colorful, rich messages  
- **Reaction**: Automatic emoji adding
- **Role**: User role management
- **Button**: Interactive buttons

### Security
- Permission control and role-based access
- Command cooldown (spam protection)
- Channel restrictions
- DM command control

### Usage
- **Slash Commands**: \`/command_name\` (recommended)
- **Prefix Commands**: \`${botConfig.prefix || '!'}command_name\`

## 🆘 Troubleshooting

### Bot doesn't appear online
- Check the token in \`.env\` file
- Make sure the bot is added to the server
- Check for error messages in terminal

### Commands not working  
- Check that the bot has the necessary permissions
- Slash commands may take 1-2 minutes to register
- Try commands starting with \`/\`

### Getting port error
- Another application might be using the same port
- Try restarting your computer

## 🔗 Useful Links

- [Discord Developer Portal](https://discord.com/developers/applications) - To get bot token
- [Discord.js Documentation](https://discord.js.org/) - For advanced features
- [Discord Bot Builder](https://github.com) - Source code of this tool

---

**When the bot runs successfully, it will appear online on Discord!** 🎉
- Kapsamlı error handling
- Command usage logs
${botConfig.activity?.name ? `- Bot aktivitesi: ${botConfig.activity.name}` : ''}

## 🔧 Konfigürasyon

Bot ayarları \`index.js\` dosyasındaki \`BOT_CONFIG\` objesinde tanımlanmıştır:

\`\`\`javascript
const BOT_CONFIG = {
  name: "${botConfig.name}",
  prefix: "${botConfig.prefix || '!'}",
  status: "${botConfig.status || 'online'}",
  ${botConfig.allowedChannels ? `allowedChannels: "${botConfig.allowedChannels}",` : ''}
  ${botConfig.allowedRoles ? `allowedRoles: "${botConfig.allowedRoles}",` : ''}
  dmCommands: ${botConfig.dmCommands || false},
  logCommands: ${botConfig.logCommands !== false},
  // ... diğer ayarlar
};
\`\`\`

## 🛡️ Güvenlik Notları

- Bot token'ınızı kimseyle paylaşmayın
- \`.env\` dosyasını git'e eklemeyin
- Botunuza sadece gerekli izinleri verin
- Düzenli olarak token'ınızı yenileyin

## 🔧 Destek

Eğer bir sorun yaşıyorsanız:

1. **Check your Node.js version**: \`node --version\`
2. **Bot token'ının doğru olduğundan emin olun**
3. **Botun sunucuda gerekli izinlere sahip olduğundan emin olun**
4. **Check console logs**

### Yaygın Sorunlar

**Bot not appearing online:**
- Check that the token is correct
- Bot'un sunucuya eklendiğinden emin olun

**Commands not working:**
- Check that the bot has message reading permissions
- Wait for slash commands to register (may take a few minutes)

**Permission errors:**
- Check that the bot has the required permissions
- Check that the bot role is above the roles it will manage

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**Discord Bot Builder** ile oluşturuldu 🤖`;
}

function generateDockerfile() {
  return `FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

CMD ["npm", "start"]`;
}

function generateDockerCompose(botName) {
  return `version: '3.8'

services:
  bot:
    build: .
    container_name: ${botName.toLowerCase().replace(/\s+/g, '-')}-bot
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs
    networks:
      - bot-network

networks:
  bot-network:
    driver: bridge`;
}

function generateInstallBat() {
  return `@echo off
title Discord Bot - Otomatik Kurulum
color 0A

echo ========================================
echo    Discord Bot Otomatik Kurulum
echo ========================================
echo.

REM Node.js kontrolü
echo [1/4] Node.js kontrol ediliyor...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js not found!
    echo.
    echo Node.js indirmek için: https://nodejs.org
    echo Minimum gereksinim: Node.js v18 veya üzeri
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js bulundu: 
node --version

echo.
echo [2/4] Bağımlılıklar yükleniyor...
npm install
if %errorlevel% neq 0 (
    echo ❌ ERROR: Dependency installation failed!
    echo.
    echo Çözüm önerileri:
    echo - Check your internet connection
    echo - Try running: npm cache clean --force
    echo - Node.js'i yeniden kurun
    echo.
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

echo.
echo [3/4] Bot konfigürasyonu kontrol ediliyor...
if not exist ".env" (
    echo ⚠️  .env file not found!
    echo Lütfen .env dosyasını açıp bot token'ınızı ekleyin.
    echo.
    pause
    exit /b 1
)

echo ✅ Konfigürasyon tamam

echo.
echo [4/4] Starting bot...
echo.
echo ========================================
echo     🤖 Discord Bot Starting
echo ========================================
echo.
echo ⏹️  Press Ctrl+C to stop
echo.

npm start

echo.
echo ========================================
echo   Bot sonlandırıldı
echo ========================================
pause
`;
}

function generateInstallSh() {
  return `#!/bin/bash

# Discord Bot - Otomatik Kurulum Script

echo "========================================"
echo "   Discord Bot Otomatik Kurulum"  
echo "========================================"
echo

# Node.js kontrolü
echo "[1/4] Node.js kontrol ediliyor..."
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js not found!"
    echo
    echo "Node.js kurmak için:"
    echo "Ubuntu/Debian: sudo apt install nodejs npm"
    echo "CentOS/RHEL: sudo yum install nodejs npm"  
    echo "macOS: brew install node"
    echo "Veya: https://nodejs.org adresinden indirin"
    echo
    exit 1
fi

echo "✅ Node.js bulundu: $(node --version)"

# Bağımlılık yükleme
echo
echo "[2/4] Bağımlılıklar yükleniyor..."
if ! npm install; then
    echo "❌ ERROR: Dependency installation failed!"
    echo
    echo "Çözüm önerileri:"
    echo "- Check your internet connection"
    echo "- Try running: npm cache clean --force"
    echo "- Node.js'i güncelleyin"
    echo
    exit 1
fi

echo "✅ Bağımlılıklar başarıyla yüklendi"

# Konfigürasyon kontrolü
echo
echo "[3/4] Bot konfigürasyonu kontrol ediliyor..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "Lütfen .env dosyasını açıp bot token'ınızı ekleyin."
    echo
    exit 1
fi

echo "✅ Konfigürasyon tamam"

# Bot startup
echo
echo "[4/4] Starting bot..."
echo
echo "========================================"
echo "    🤖 Discord Bot Starting"
echo "========================================"
echo
echo "⏹️  Press Ctrl+C to stop"
echo

npm start

echo
echo "========================================"
echo "   Bot sonlandırıldı"
echo "========================================"
`;
}

export default { generateBotCode };
