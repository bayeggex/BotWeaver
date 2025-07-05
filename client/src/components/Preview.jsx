import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Download,
  Computer,
  Code,
  PlayArrow,
  CheckCircle,
  Terminal,
  Token,
  Settings,
  CloudDownload,
  DesktopWindows,
  Launch,
  Info,
} from '@mui/icons-material';
import WebBotHost from './WebBotHost';

const Preview = ({ botConfig, onDownload, loading }) => {
  const [helpDialog, setHelpDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [hostingMode, setHostingMode] = useState('download'); // 'download' or 'web'

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenHelp = () => {
    setHelpDialog(true);
  };

  const handleCloseHelp = () => {
    setHelpDialog(false);
  };

  const handleHostingModeChange = (mode) => {
    setHostingMode(mode);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Bot Preview & Download
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Info />}
          onClick={handleOpenHelp}
          size="small"
        >
          Hosting Options
        </Button>
      </Box>
      
      <Alert severity="success" sx={{ mb: 3 }}>
        🎉 Your bot is ready! Review the summary below and choose your hosting option.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Settings color="primary" />
                Bot Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Token />
                  </ListItemIcon>
                  <ListItemText
                    primary="Bot Name"
                    secondary={botConfig.name}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Code />
                  </ListItemIcon>
                  <ListItemText
                    primary="Prefix"
                    secondary={botConfig.prefix}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Terminal />
                  </ListItemIcon>
                  <ListItemText
                    primary="Command Count"
                    secondary={`${botConfig.commands.length} commands`}
                  />
                </ListItem>
                {botConfig.activity?.name && (
                  <ListItem>
                    <ListItemIcon>
                      <PlayArrow />
                    </ListItemIcon>
                    <ListItemText
                      primary="Bot Aktivitesi"
                      secondary={`${botConfig.activity.type}: ${botConfig.activity.name}`}
                    />
                  </ListItem>
                )}
                {botConfig.allowedChannels && (
                  <ListItem>
                    <ListItemIcon>
                      <Settings />
                    </ListItemIcon>
                    <ListItemText
                      primary="Restricted Channels"
                      secondary={`${botConfig.allowedChannels.split(',').length} channels`}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Terminal color="primary" />
            Commands
          </Typography>
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {botConfig.commands.map((command, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="body2" fontWeight="bold">
                        /{command.name}
                      </Typography>
                      {command.type && command.type !== 'text' && (
                        <Chip 
                          label={command.type.toUpperCase()} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      )}
                      {command.ephemeral && (
                        <Chip label="Gizli" size="small" color="secondary" />
                      )}
                      {command.permissions && command.permissions.length > 0 && (
                        <Chip 
                          label={`${command.permissions.length} izin`} 
                          size="small" 
                          color="warning" 
                        />
                      )}
                      {command.cooldown > 0 && (
                        <Chip 
                          label={`${command.cooldown}s`} 
                          size="small" 
                          color="info" 
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      {command.description || 'No description'}
                    </Typography>
                    {command.parameters && command.parameters.length > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
                        Parameters: {command.parameters.map(p => p.name).join(', ')}
                      </Typography>
                    )}
                    {index < botConfig.commands.length - 1 && <Divider sx={{ mt: 1 }} />}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Computer color="primary" />
            Download Contents
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The ZIP file you download will include:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText
                primary="index.js"
                secondary="Main bot file (Discord.js v14)"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText
                primary="package.json"
                secondary="Project configuration and dependencies"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText
                primary=".env"
                secondary="Environment variables (for token security)"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText
                primary="README.md"
                secondary="Installation and usage instructions"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Docker Files"
                secondary="Dockerfile ve docker-compose.yml"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Installation Steps:</strong><br />
          1. Download and extract the ZIP file<br />
          2. Install dependencies with <code>npm install</code><br />
          3. Update your bot token in the <code>.env</code> file<br />
          4. Start the bot with <code>npm start</code>
        </Typography>
      </Alert>

      <Box sx={{ mt: 3 }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={hostingMode === 'download' ? 4 : 2} 
              sx={{ 
                p: 2, 
                textAlign: 'center', 
                height: '100%', 
                cursor: 'pointer',
                border: hostingMode === 'download' ? '2px solid' : '1px solid',
                borderColor: hostingMode === 'download' ? 'primary.main' : 'divider'
              }}
              onClick={() => handleHostingModeChange('download')}
            >
              <DesktopWindows sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                🏠 Run on My Computer
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Download bot files and run on your own computer. 
                Full control and security.
              </Typography>
              <Typography variant="caption" display="block" sx={{ mb: 1, color: 'success.main' }}>
                ✅ Recommended: Full control and security
              </Typography>
              {hostingMode === 'download' && (
                <Chip label="Selected" color="primary" size="small" />
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={hostingMode === 'web' ? 4 : 2} 
              sx={{ 
                p: 2, 
                textAlign: 'center', 
                height: '100%', 
                cursor: 'pointer',
                border: hostingMode === 'web' ? '2px solid' : '1px solid',
                borderColor: hostingMode === 'web' ? 'secondary.main' : 'divider'
              }}
              onClick={() => handleHostingModeChange('web')}
            >
              <Launch sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                🌐 Manage from This Web Interface
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Your bot runs here as long as this web interface stays open. 
                Ideal for quick testing.
              </Typography>
              <Typography variant="caption" display="block" sx={{ mb: 1, color: 'warning.main' }}>
                ⚡ For quick testing (Active)
              </Typography>
              {hostingMode === 'web' && (
                <Chip label="Selected" color="secondary" size="small" />
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Hosting Content */}
        {hostingMode === 'download' ? (
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Download Bot Files
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                ZIP file will be created and downloaded. Installation instructions included.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<CloudDownload />}
                onClick={onDownload}
                disabled={loading}
                sx={{ minWidth: 250 }}
              >
                {loading ? 'Downloading...' : 'Download Bot Files'}
              </Button>
            </Box>
          </Paper>
        ) : (
          <Paper elevation={2} sx={{ p: 3 }}>
            <WebBotHost botConfig={botConfig} />
          </Paper>
        )}
      </Box>

      {/* Hosting Options Dialog */}
      <Dialog open={helpDialog} onClose={handleCloseHelp} maxWidth="md" fullWidth>
        <DialogTitle>
          🚀 Bot Hosting Options and Setup Guide
        </DialogTitle>
        <DialogContent>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="🏠 My Computer" />
            <Tab label="☁️ Cloud Hosting" />
            <Tab label="🔧 Setup Steps" />
          </Tabs>

          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Self-Hosting on Your Computer
              </Typography>
              <Alert severity="success" sx={{ mb: 2 }}>
                ✅ <strong>Recommended Option:</strong> Full control, free and secure
              </Alert>
              
              <Typography variant="body1" paragraph>
                <strong>Advantages:</strong>
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                  <ListItemText primary="Completely free" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                  <ListItemText primary="Your token stays secure with you" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                  <ListItemText primary="Full control and customization" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                  <ListItemText primary="Runs as long as you have internet" />
                </ListItem>
              </List>

              <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                <strong>Requirements:</strong>
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><Computer /></ListItemIcon>
                  <ListItemText primary="Node.js v18 or higher" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Computer /></ListItemIcon>
                  <ListItemText primary="Stable internet connection" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Computer /></ListItemIcon>
                  <ListItemText primary="Keep computer running (optional)" />
                </ListItem>
              </List>
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom color="secondary">
                Cloud Hosting Options
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                💡 Popular cloud platforms for advanced users
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold">
                        🆓 Free Options
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="Railway" 
                            secondary="Easy deployment, limited time"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Heroku (Hobby)" 
                            secondary="Popular but has sleep mode"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Glitch" 
                            secondary="Ideal for simple projects"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold">
                        💰 Paid Options
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="DigitalOcean" 
                            secondary="$5/ay, stabil performans"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="AWS/Google Cloud" 
                            secondary="Enterprise level"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="VPS Hosting" 
                            secondary="Flexible and customizable"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Important:</strong> When using cloud hosting, remember to keep your bot token secure 
                  with environment variables (.env file)!
                </Typography>
              </Alert>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom color="info.main">
                📋 Step-by-Step Installation Guide
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  1️⃣ Download Bot Files
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Click the "Download Bot Files" button<br />
                  • Save the ZIP file to your computer<br />
                  • Extract the file (Extract/Unzip)
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  2️⃣ Install Required Software
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Download Node.js: <code>https://nodejs.org</code><br />
                  • Open Terminal/Command Prompt<br />
                  • Navigate to bot folder: <code>cd bot-folder-name</code>
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  3️⃣ Install Dependencies
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Run this command in terminal:<br />
                  <code>npm install</code><br />
                  • This installs discord.js and other packages
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  4️⃣ Configure Your Bot Token
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Open the <code>.env</code> file<br />
                  • Find the line <code>BOT_TOKEN=your-bot-token</code><br />
                  • Paste your token from Discord Developer Portal
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  5️⃣ Start Your Bot
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Run this command in terminal:<br />
                  <code>npm start</code><br />
                  • When bot comes online, you'll see "Bot ready!" message
                </Typography>
              </Paper>

              <Alert severity="success">
                <Typography variant="body2">
                  🎉 <strong>Congratulations!</strong> Your bot is now active on your Discord server. 
                  Don't forget to test your commands!
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHelp} color="primary">
            Got it
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Preview;
