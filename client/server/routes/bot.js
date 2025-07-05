import express from 'express';
import archiver from 'archiver';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { spawn, exec } from 'child_process';
import { generateBotCode } from '../services/botGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Store running bot processes
const runningBots = new Map();

// Ensure temp directory exists
const tempBaseDir = path.join(__dirname, '../../temp');
fs.ensureDir(tempBaseDir).catch(err => {
  console.error('Failed to create temp directory:', err);
});

// Generate and download bot
router.post('/generate', async (req, res) => {
  try {
    const { botConfig } = req.body;
    
    if (!botConfig || !botConfig.name) {
      return res.status(400).json({ error: 'Bot configuration is required' });
    }

    // Generate unique ID for this bot
    const botId = uuidv4();
    const tempDir = path.join(__dirname, '../../temp', botId);

    // Create temporary directory
    await fs.ensureDir(tempDir);

    // Generate bot files
    await generateBotCode(botConfig, tempDir);

    // Create zip file
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${botConfig.name}-bot.zip"`);

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(res);
    archive.directory(tempDir, false);
    await archive.finalize();

    // Cleanup temp directory after sending
    setTimeout(async () => {
      try {
        await fs.remove(tempDir);
      } catch (err) {
        console.error('Failed to cleanup temp directory:', err);
      }
    }, 5000);

  } catch (error) {
    console.error('Error generating bot:', error);
    res.status(500).json({ error: 'Failed to generate bot' });
  }
});

// Validate bot configuration
router.post('/validate', (req, res) => {
  try {
    const { botConfig } = req.body;
    
    const errors = [];
    
    if (!botConfig.name || botConfig.name.trim().length === 0) {
      errors.push('Bot name is required');
    }
    
    if (!botConfig.token || botConfig.token.trim().length === 0) {
      errors.push('Bot token is required');
    }
    
    if (!botConfig.commands || botConfig.commands.length === 0) {
      errors.push('At least one command is required');
    }

    // Validate commands
    if (botConfig.commands) {
      botConfig.commands.forEach((cmd, index) => {
        if (!cmd.name || cmd.name.trim().length === 0) {
          errors.push(`Command ${index + 1}: Name is required`);
        }
        if (!cmd.response || cmd.response.trim().length === 0) {
          errors.push(`Command ${index + 1}: Response is required`);
        }
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({ valid: false, errors });
    }

    res.json({ valid: true, message: 'Bot configuration is valid' });
  } catch (error) {
    console.error('Error validating bot:', error);
    res.status(500).json({ error: 'Failed to validate bot configuration' });
  }
});

// Web-based bot hosting endpoints
router.post('/start', async (req, res) => {
  try {
    const { botConfig } = req.body;
    
    if (!botConfig || !botConfig.name || !botConfig.token) {
      return res.status(400).json({ error: 'Bot configuration with token is required' });
    }

    const botId = botConfig.name.toLowerCase().replace(/\s+/g, '-');
    
    // Check if bot is already running
    if (runningBots.has(botId)) {
      return res.status(400).json({ error: 'Bot is already running' });
    }

    // Generate unique directory for this bot
    const tempDir = path.join(__dirname, '../../temp', `running-${botId}-${Date.now()}`);
    
    try {
      await fs.ensureDir(tempDir);
    } catch (dirError) {
      console.error('Failed to create temp directory:', dirError);
      return res.status(500).json({ error: 'Failed to create temporary directory' });
    }

    try {
      // Generate bot files
      await generateBotCode(botConfig, tempDir);
    } catch (genError) {
      console.error('Failed to generate bot code:', genError);
      fs.remove(tempDir).catch(cleanupError => {
        console.error('Failed to cleanup temp directory:', cleanupError);
      });
      return res.status(500).json({ error: 'Failed to generate bot code' });
    }

    // Install dependencies
    const isWindows = process.platform === 'win32';
    const installProcess = spawn(isWindows ? 'npm.cmd' : 'npm', ['install'], {
      cwd: tempDir,
      stdio: 'pipe',
      shell: isWindows
    });

    let installTimeout = setTimeout(() => {
      installProcess.kill();
      if (!res.headersSent) {
        res.status(500).json({ error: 'Installation timeout' });
      }
    }, 60000); // 60 second timeout

    installProcess.on('close', (code) => {
      clearTimeout(installTimeout);
      
      if (code === 0) {
        // Start the bot
        const botProcess = spawn('node', ['index.js'], {
          cwd: tempDir,
          stdio: 'pipe',
          env: { ...process.env, DISCORD_TOKEN: botConfig.token },
          shell: isWindows
        });

        const logs = [];
        
        botProcess.stdout.on('data', (data) => {
          const message = data.toString();
          logs.push({ type: 'info', message, timestamp: new Date().toISOString() });
          console.log(`[${botId}] ${message}`);
        });

        botProcess.stderr.on('data', (data) => {
          const message = data.toString();
          logs.push({ type: 'error', message, timestamp: new Date().toISOString() });
          console.error(`[${botId}] ERROR: ${message}`);
        });

        botProcess.on('close', (code) => {
          logs.push({ 
            type: 'info', 
            message: `Bot process exited with code ${code}`, 
            timestamp: new Date().toISOString() 
          });
          runningBots.delete(botId);
          
          // Cleanup temp directory
          setTimeout(async () => {
            try {
              await fs.remove(tempDir);
            } catch (err) {
              console.error('Failed to cleanup temp directory:', err);
            }
          }, 5000);
        });

        // Store bot info
        runningBots.set(botId, {
          process: botProcess,
          config: botConfig,
          logs: logs,
          startTime: new Date(),
          tempDir: tempDir
        });

        if (!res.headersSent) {
          res.json({ 
            success: true, 
            message: 'Bot started successfully',
            botId: botId
          });
        }
      } else {
        // Installation failed
        console.error(`Installation failed with code ${code} for bot ${botId}`);
        fs.remove(tempDir).catch(cleanupError => {
          console.error('Failed to cleanup temp directory:', cleanupError);
        });
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to install dependencies' });
        }
      }
    });

    installProcess.on('error', (err) => {
      clearTimeout(installTimeout);
      console.error('Installation process error:', err);
      fs.remove(tempDir).catch(cleanupError => {
        console.error('Failed to cleanup temp directory:', cleanupError);
      });
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to start installation process' });
      }
    });

  } catch (error) {
    console.error('Error starting bot:', error);
    res.status(500).json({ error: 'Failed to start bot' });
  }
});

router.post('/stop', (req, res) => {
  try {
    const { botId } = req.body;
    
    if (!botId || !runningBots.has(botId)) {
      return res.status(404).json({ error: 'Bot not found or not running' });
    }

    const botInfo = runningBots.get(botId);
    
    // Kill the process
    botInfo.process.kill('SIGTERM');
    
    // Add stop log
    botInfo.logs.push({
      type: 'info',
      message: 'Bot stopped by user',
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Bot stopped successfully' });
    
  } catch (error) {
    console.error('Error stopping bot:', error);
    res.status(500).json({ error: 'Failed to stop bot' });
  }
});

router.get('/status/:botId', (req, res) => {
  try {
    const { botId } = req.params;
    
    if (!runningBots.has(botId)) {
      return res.json({ 
        running: false, 
        message: 'Bot not running' 
      });
    }

    const botInfo = runningBots.get(botId);
    const uptime = Date.now() - botInfo.startTime.getTime();
    
    res.json({
      running: true,
      botId: botId,
      name: botInfo.config.name,
      uptime: Math.floor(uptime / 1000), // seconds
      startTime: botInfo.startTime,
      logs: botInfo.logs.slice(-50) // Last 50 log entries
    });
    
  } catch (error) {
    console.error('Error getting bot status:', error);
    res.status(500).json({ error: 'Failed to get bot status' });
  }
});

router.get('/list', (req, res) => {
  try {
    const botList = Array.from(runningBots.entries()).map(([botId, botInfo]) => {
      // Safety check for botInfo
      if (!botInfo || !botInfo.config || !botInfo.startTime) {
        console.warn(`Invalid bot info for ${botId}, removing from list`);
        runningBots.delete(botId);
        return null;
      }
      
      return {
        botId,
        name: botInfo.config.name,
        startTime: botInfo.startTime,
        uptime: Math.floor((Date.now() - botInfo.startTime.getTime()) / 1000)
      };
    }).filter(bot => bot !== null); // Remove null entries
    
    res.json({ bots: botList });
    
  } catch (error) {
    console.error('Error listing bots:', error);
    res.status(500).json({ error: 'Failed to list bots' });
  }
});

// JSON Configuration Export/Import endpoints
router.post('/export', (req, res) => {
  try {
    const { botConfig } = req.body;
    
    if (!botConfig || !botConfig.name) {
      return res.status(400).json({ error: 'Bot configuration is required' });
    }

    // Clean up sensitive data for export
    const exportConfig = {
      ...botConfig,
      token: '', // Remove token for security
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${botConfig.name}-config.json"`);
    res.json(exportConfig);

  } catch (error) {
    console.error('Error exporting bot config:', error);
    res.status(500).json({ error: 'Failed to export bot configuration' });
  }
});

router.post('/import', (req, res) => {
  try {
    const { configData } = req.body;
    
    if (!configData || typeof configData !== 'object') {
      return res.status(400).json({ error: 'Invalid configuration data' });
    }

    // Validate imported config
    const validatedConfig = {
      name: configData.name || 'Imported Bot',
      description: configData.description || '',
      token: '', // User needs to add token manually
      prefix: configData.prefix || '!',
      status: configData.status || 'online',
      useSlashCommands: configData.useSlashCommands !== false,
      activity: configData.activity || { type: 'PLAYING', name: '', url: '' },
      allowedRoles: configData.allowedRoles || '',
      allowedChannels: configData.allowedChannels || '',
      dmCommands: configData.dmCommands || false,
      logCommands: configData.logCommands !== false,
      errorChannelId: configData.errorChannelId || '',
      ownerId: configData.ownerId || '',
      autoReconnect: configData.autoReconnect !== false,
      deleteCommands: configData.deleteCommands || false,
      commands: Array.isArray(configData.commands) ? configData.commands : []
    };

    res.json({ 
      success: true, 
      message: 'Configuration imported successfully',
      config: validatedConfig 
    });

  } catch (error) {
    console.error('Error importing bot config:', error);
    res.status(500).json({ error: 'Failed to import bot configuration' });
  }
});

// Cleanup endpoint for browser close
router.post('/cleanup', (req, res) => {
  try {
    const { action, botIds } = req.body;
    
    if (action === 'stopAll' && Array.isArray(botIds)) {
      botIds.forEach(botId => {
        const process = runningBots.get(botId);
        if (process && process.bot) {
          try {
            process.bot.kill('SIGTERM');
            runningBots.delete(botId);
            console.log(`🛑 Bot ${botId} stopped due to browser close`);
          } catch (error) {
            console.error(`Error stopping bot ${botId}:`, error);
          }
        }
      });
    }
    
    res.json({ success: true, message: 'Cleanup completed' });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Cleanup failed' });
  }
});

export default router;
