import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Info, 
  ExpandMore,
  Settings,
  Security,
  Message,
  Notifications
} from '@mui/icons-material';

const AdvancedBotConfig = ({ botConfig, setBotConfig }) => {
  const [showToken, setShowToken] = React.useState(false);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setBotConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleActivityChange = (field) => (event) => {
    setBotConfig(prev => ({
      ...prev,
      activity: {
        ...prev.activity,
        [field]: event.target.value
      }
    }));
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Bot Configuration
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        To get a Discord bot token, visit{' '}
        <Link href="https://discord.com/developers/applications" target="_blank">
          Discord Developer Portal
        </Link>
      </Alert>

      {/* Basic Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings color="primary" />
            Basic Settings
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Bot Name"
                value={botConfig.name || ''}
                onChange={handleChange('name')}
                required
                fullWidth
                placeholder="e.g: Helper Bot"
                helperText="Display name for your bot"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Bot Description"
                value={botConfig.description || ''}
                onChange={handleChange('description')}
                fullWidth
                placeholder="Briefly describe what your bot does"
                helperText="Description for README file"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Bot Token"
                type={showToken ? 'text' : 'password'}
                value={botConfig.token || ''}
                onChange={handleChange('token')}
                required
                fullWidth
                placeholder="Paste your bot token here"
                helperText="Bot token from Discord Developer Portal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Show/hide token">
                        <IconButton
                          onClick={() => setShowToken(!showToken)}
                          edge="end"
                        >
                          {showToken ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Command Prefix"
                value={botConfig.prefix || '!'}
                onChange={handleChange('prefix')}
                fullWidth
                placeholder="!"
                helperText="Character for prefix commands"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Special character used for prefix commands">
                        <Info color="action" />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Bot Status</InputLabel>
                <Select
                  value={botConfig.status || 'online'}
                  onChange={handleChange('status')}
                >
                  <MenuItem value="online">🟢 Online</MenuItem>
                  <MenuItem value="idle">🟡 Idle</MenuItem>
                  <MenuItem value="dnd">🔴 Do Not Disturb</MenuItem>
                  <MenuItem value="invisible">⚫ Invisible</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={botConfig.useSlashCommands !== false}
                    onChange={(e) => setBotConfig(prev => ({
                      ...prev,
                      useSlashCommands: e.target.checked
                    }))}
                  />
                }
                label="Enable Slash Commands (/command)"
              />
              <Typography variant="caption" display="block" color="text.secondary">
                {botConfig.useSlashCommands !== false 
                  ? "✅ Users can use both /command and !command" 
                  : "⚠️ Only prefix commands (!command) will work"
                }
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bot Aktivitesi */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Message color="primary" />
            <Typography variant="h6">Bot Activity & Status Message</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Activity Type</InputLabel>
                <Select
                  value={botConfig.activity?.type || 'PLAYING'}
                  onChange={handleActivityChange('type')}
                >
                  <MenuItem value="PLAYING">🎮 Playing</MenuItem>
                  <MenuItem value="STREAMING">📺 Streaming</MenuItem>
                  <MenuItem value="LISTENING">🎵 Listening</MenuItem>
                  <MenuItem value="WATCHING">👀 Watching</MenuItem>
                  <MenuItem value="COMPETING">🏆 Competing</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <TextField
                label="Activity Message"
                value={botConfig.activity?.name || ''}
                onChange={handleActivityChange('name')}
                fullWidth
                placeholder="with Discord"
                helperText="Status message that appears in bot profile"
              />
            </Grid>

            {botConfig.activity?.type === 'STREAMING' && (
              <Grid item xs={12}>
                <TextField
                  label="Stream URL"
                  value={botConfig.activity?.url || ''}
                  onChange={handleActivityChange('url')}
                  fullWidth
                  placeholder="https://twitch.tv/yourstream"
                  helperText="Only Twitch and YouTube URLs are supported"
                />
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Permissions and Security */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security color="primary" />
            <Typography variant="h6">Security Settings</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Allowed Roles (IDs, comma separated)"
                value={botConfig.allowedRoles || ''}
                onChange={handleChange('allowedRoles')}
                fullWidth
                placeholder="123456789,987654321"
                helperText="Users with these roles can use all commands"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Allowed Channels (IDs, comma separated)"
                value={botConfig.allowedChannels || ''}
                onChange={handleChange('allowedChannels')}
                fullWidth
                placeholder="123456789,987654321"
                helperText="Bot will only work in these channels"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={botConfig.dmCommands || false}
                    onChange={handleChange('dmCommands')}
                  />
                }
                label="Allow DM (Direct Message) commands"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={botConfig.logCommands || true}
                    onChange={handleChange('logCommands')}
                  />
                }
                label="Log command usage"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Advanced Settings */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Notifications color="primary" />
            <Typography variant="h6">Advanced Settings</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Error Report Channel ID"
                value={botConfig.errorChannelId || ''}
                onChange={handleChange('errorChannelId')}
                fullWidth
                placeholder="123456789"
                helperText="Errors will be sent to this channel"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Owner User ID"
                value={botConfig.ownerId || ''}
                onChange={handleChange('ownerId')}
                fullWidth
                placeholder="123456789"
                helperText="Discord ID of the bot owner"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={botConfig.autoReconnect || true}
                    onChange={handleChange('autoReconnect')}
                  />
                }
                label="Auto reconnect"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={botConfig.deleteCommands || false}
                    onChange={handleChange('deleteCommands')}
                  />
                }
                label="Auto-delete command messages"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Alert severity="warning" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>⚠️ Security Warning:</strong><br />
          • Never share your bot token with anyone<br />
          • Don't store tokens in public repositories<br />
          • Regularly regenerate your bot token<br />
          • Keep bot permissions minimal as needed
        </Typography>
      </Alert>
    </Box>
  );
};

export default AdvancedBotConfig;
