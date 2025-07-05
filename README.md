# 🤖 BotWeaver - Secure Self-Hosted Discord Bot Builder

<div align="center">
  <img src="client/public/BotWeaver.png" alt="BotWeaver Logo" width="300"/>
  
  [![Discord ToS Compliant](https://img.shields.io/badge/Discord%20ToS-Compliant-green)](https://discord.com/terms)
  [![Self-Hosted](https://img.shields.io/badge/Self--Hosted-Security-blue)](https://github.com/bayeggex/BotWeaver)
  [![Open Source](https://img.shields.io/badge/Open%20Source-MIT-yellow)](LICENSE)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-18+-blue)](https://reactjs.org/)
</div>

## 🚀 What is BotWeaver?

**BotWeaver** is a secure, open-source, self-hosted Discord bot builder that empowers users to create powerful Discord bots without writing a single line of code. Built with security and Discord Terms of Service compliance at its core, BotWeaver runs entirely on your own infrastructure, ensuring your bot tokens and data remain completely under your control.

### ✨ Key Features

- 🛡️ **Security First**: Your bot tokens never leave your server
- 📜 **Discord ToS Compliant**: Fully adheres to Discord's Terms of Service
- 🏠 **Self-Hosted**: Complete control over your data and infrastructure
- 🎨 **No-Code Interface**: Intuitive drag-and-drop bot builder
- ⚡ **Modern Tech Stack**: React + Node.js + Material-UI
- 🔄 **Export/Import**: Save and share bot configurations as JSON
- 💬 **Flexible Commands**: Support for both prefix and slash commands
- � **Docker Ready**: One-click deployment with Docker
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile

## 🔒 Security & Compliance

### Security Features
- **Token Security**: Bot tokens are stored locally and never transmitted to external servers
- **Self-Hosted**: All processing happens on your own infrastructure
- **Open Source**: Full transparency with auditable code
- **Secure Communication**: HTTPS support and secure API endpoints
- **No External Dependencies**: No third-party services required for bot operation

### Discord ToS Compliance
- ✅ Respects Discord's rate limits and API guidelines
- ✅ Implements proper permission checks
- ✅ Follows Discord's community guidelines
- ✅ Uses official Discord.js library
- ✅ No unauthorized data collection or storage

## 🎯 Perfect For

- **Server Administrators** who want custom bots without coding
- **Security-Conscious Users** who need full control over their data
- **Developers** who want to quickly prototype Discord bots
- **Communities** seeking reliable, self-hosted bot solutions
- **Educational Purposes** for learning Discord bot development

## 🚀 Quick Start

### ⚡ Super Easy Installation (For Beginners)

**🖱️ One-Click Setup - No Technical Knowledge Required!**

#### For Windows Users:
1. **Download** the BotWeaver project to your computer
2. **Double-click** the `start.bat` file in the main folder
3. **Wait** for the automatic setup (takes 2-3 minutes first time)
4. **Done!** Your browser will open BotWeaver automatically

#### For Mac/Linux Users:
1. **Download** the BotWeaver project to your computer
2. **Right-click** on the `start.sh` file → "Open with Terminal"
3. **Wait** for the automatic setup (takes 2-3 minutes first time)
4. **Done!** Your browser will open BotWeaver automatically

> **💡 First Time Setup:** The very first run will take a few minutes to download and install everything needed. After that, it starts instantly!

### 🛠️ What the Setup Does Automatically:
- ✅ Checks if you have the required software (and tells you how to get it if not)
- ✅ Downloads all necessary components
- ✅ Builds the application
- ✅ Starts the secure local server
- ✅ Opens your web browser to BotWeaver

### 🚨 If Something Goes Wrong:
- **"Node.js not found"**: [Download Node.js here](https://nodejs.org) (choose the LTS version)
- **Port already in use**: The script will automatically fix this
- **Any other error**: Just run the start file again - it usually fixes itself!

---

### 🎓 Alternative Installation Methods

### 🎓 Alternative Installation Methods

#### Option A: Docker (For Advanced Users)
```bash
docker-compose up -d
```

#### Option B: Manual Installation (For Developers)
1. **Prerequisites**
   - Node.js 18+ 
   - npm or yarn

2. **Installation**
   ```bash
   # Clone the repository
   git clone https://github.com/bayeggex/BotWeaver.git
   cd BotWeaver

   # Install dependencies
   npm install
   cd client && npm install

   # Start the application
   npm run dev
   ```

3. **Access the Interface**
   - Open your browser to `http://localhost:3000`
   - Start building your Discord bot!

## 🎨 How to Build Your Bot

### Step 1: Configure Bot Settings
- Enter your bot name and description
- Add your Discord bot token
- Choose between prefix (`!`) or slash commands
- Set up bot status and activity

### Step 2: Create Commands
- Use the visual command builder
- Add responses, embeds, buttons, and roles
- Set permissions and cooldowns
- Configure advanced features

### Step 3: Preview & Deploy
- Review your bot configuration
- Choose hosting option:
  - **Self-Hosted** (Recommended): Download and run on your server
  - **Web Testing**: Quick testing through the web interface

### Step 4: Export/Import
- Save configurations as JSON files
- Share bot templates with your team
- Version control your bot setups

## �️ Advanced Features

### Command Types Supported
- **Text Commands**: Simple text responses
- **Embed Messages**: Rich, formatted messages
- **Interactive Buttons**: Clickable user interactions
- **Role Management**: Automatic role assignment
- **Permission Controls**: Role and channel restrictions
- **Cooldown Systems**: Prevent command spam

### Bot Configuration Options
- Custom prefix or slash commands
- Activity status and presence
- Error logging and reporting
- Auto-reconnection handling
- Advanced permission systems

## 🏗️ Architecture

```
BotWeaver/
├── client/          # React frontend (Vite + Material-UI)
├── server/          # Node.js backend (Express)
├── generated-bots/  # User-created bot files
├── docker/          # Docker configuration
└── docs/           # Documentation
```

### Technology Stack
- **Frontend**: React 18, Vite, Material-UI
- **Backend**: Node.js, Express.js
- **Bot Framework**: Discord.js v14
- **Database**: File-based JSON (no external DB required)
- **Containerization**: Docker & Docker Compose
## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Clone and install
git clone https://github.com/bayeggex/BotWeaver.git
cd BotWeaver
npm install

# Start development servers
npm run dev          # Starts both frontend and backend
npm run client       # Frontend only
npm run server       # Backend only
```

## � Documentation

- [Getting Started Guide](docs/getting-started.md)
- [API Documentation](docs/api.md)
- [Security Guidelines](docs/security.md)
- [Docker Deployment](docs/docker.md)
- [Troubleshooting](docs/troubleshooting.md)

## � Support & Issues

- **Bug Reports**: [GitHub Issues](https://github.com/bayeggex/BotWeaver/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/bayeggex/BotWeaver/discussions)
- **Security Issues**: Please email security@botweaver.dev

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Discord.js community for the excellent library
- Material-UI team for the beautiful components
- All contributors and supporters of this project

## ⚠️ Disclaimer

BotWeaver is an independent project and is not affiliated with or endorsed by Discord Inc. Users are responsible for ensuring their bots comply with Discord's Terms of Service and Community Guidelines.

---

<div align="center">
  <strong>Built with ❤️ for the Discord community</strong><br>
  <a href="https://github.com/bayeggex/BotWeaver">🌟 Star us on GitHub</a>
</div>
- How you envision it working
- Why it would be beneficial

---

## 📄 License

BotWeaver is released under the **MIT License**. This means you can:
- ✅ Use it commercially
- ✅ Modify the source code
- ✅ Distribute your changes
- ✅ Use it privately

See the [LICENSE](LICENSE) file for full details.

---

## 🎉 Community & Support

### 💬 Get Help
- **📖 Documentation**: Check our comprehensive guides
- **🐛 Issues**: Report bugs on GitHub
- **💡 Discussions**: Join community discussions
- **📧 Contact**: Reach out for support

### 🌟 Show Your Support
If BotWeaver helped you create amazing Discord bots, consider:
- ⭐ **Starring the repository**
- 🍴 **Forking and contributing**
- 📢 **Sharing with friends**
- 💖 **Sponsoring the project**

---

## ⚠️ Disclaimer

BotWeaver is a tool for creating Discord bots. Users are responsible for:
- Ensuring their bots comply with Discord's Terms of Service
- Following server rules and community guidelines
- Respecting user privacy and data protection laws
- Using the tool responsibly and ethically

---

<p align="center">
  <strong>Built with ❤️ by the open source community</strong>
</p>

<p align="center">
  <a href="https://github.com/yourusername/botweaver">🌟 Star on GitHub</a> •
  <a href="https://github.com/yourusername/botweaver/blob/main/LICENSE">📄 License</a> •
  <a href="https://github.com/yourusername/botweaver/issues">🐛 Report Bug</a> •
  <a href="https://github.com/yourusername/botweaver/discussions">💬 Discussions</a>
</p>

## 👶 Complete Beginner's Guide

### 📥 Step 1: Download BotWeaver
1. Go to the [BotWeaver GitHub page](https://github.com/bayeggex/BotWeaver)
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Extract the ZIP file to your Desktop or Documents folder

### 🤖 Step 2: Create Your Discord Bot
Before using BotWeaver, you need to create a bot in Discord:

1. **Go to [Discord Developer Portal](https://discord.com/developers/applications)**
2. **Click "New Application"** and give it a name
3. **Go to "Bot" section** in the left menu
4. **Click "Add Bot"**
5. **Copy the Token** (you'll need this in BotWeaver)
6. **Go to "OAuth2" → "URL Generator"**
7. **Select "bot" scope** and the permissions you want
8. **Copy the generated URL** and open it to invite your bot to your server

### 🚀 Step 3: Start BotWeaver
1. **Find the BotWeaver folder** you extracted
2. **Double-click `start.bat`** (Windows) or **double-click `start.sh`** (Mac/Linux)
3. **Wait for setup** (first time takes 2-3 minutes)
4. **Your browser will open** BotWeaver automatically

### ⚙️ Step 4: Configure Your Bot
1. **Enter your bot's name** and description
2. **Paste the bot token** you copied from Discord
3. **Choose command type** (Slash commands recommended for beginners)
4. **Click "Next"**

### 🎯 Step 5: Add Commands
1. **Click "Add Command"**
2. **Choose command type** (Text Response is easiest for beginners)
3. **Enter command name** (e.g., "hello")
4. **Enter response** (e.g., "Hello there!")
5. **Add more commands** as needed
6. **Click "Next"**

### 📥 Step 6: Download and Run Your Bot
1. **Review your bot** in the preview
2. **Click "Download Bot Files"**
3. **Extract the downloaded ZIP file**
4. **Double-click `start.bat`** in the bot folder
5. **Your bot is now online!**

### 🎉 Step 7: Test Your Bot
1. **Go to your Discord server**
2. **Type `/hello`** (or `!hello` if using prefix commands)
3. **Your bot should respond!**

---

## 🔧 Troubleshooting for Beginners

### ❌ "Node.js not found"
**Solution:** [Download and install Node.js](https://nodejs.org) (choose the "LTS" version)

### ❌ "Bot not responding in Discord"
**Solutions:**
- Make sure you invited the bot to your server
- Check that the bot is online (green dot in Discord)
- Verify the bot has permissions to read/send messages

### ❌ "Port already in use"
**Solution:** The start script will fix this automatically. If not, restart your computer.

### ❌ "Token invalid"
**Solution:** 
- Go back to Discord Developer Portal
- Regenerate your bot token
- Update it in BotWeaver

### 🆘 Need More Help?
- Check our [Troubleshooting Guide](docs/troubleshooting.md)
- [Open an issue](https://github.com/bayeggex/BotWeaver/issues) on GitHub
- Make sure to describe what you tried and what error you got
