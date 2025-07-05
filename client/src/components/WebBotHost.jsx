import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Divider,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Computer,
  Refresh,
  Terminal,
  ExpandMore,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import api from '../utils/api';

const WebBotHost = ({ botConfig }) => {
  const [runningBots, setRunningBots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [botLogs, setBotLogs] = useState([]);
  const [selectedBotId, setSelectedBotId] = useState(null);
  const [logsDialog, setLogsDialog] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // Fetch running bots list
  const fetchRunningBots = async () => {
    try {
      const response = await api.get('/api/bot/list');
      setRunningBots(response.data.bots || []);
    } catch (error) {
      console.error('Error fetching running bots:', error);
    }
  };

  // Fetch bot status and logs
  const fetchBotStatus = async (botId) => {
    try {
      const response = await api.get(`/api/bot/status/${botId}`);
      if (response.data.running) {
        setBotLogs(response.data.logs || []);
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching bot status:', error);
      return null;
    }
  };

  // Start bot
  const startBot = async () => {
    if (!botConfig.token || !botConfig.name) {
      setError('Bot token and name are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/api/bot/start', {
        botConfig
      });

      if (response.data.success) {
        setSuccess('Bot started successfully!');
        setTimeout(() => {
          fetchRunningBots();
        }, 2000);
      }
    } catch (error) {
      console.error('Error starting bot:', error);
      
      let errorMessage = 'Bot could not be started.';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Server connection failed. Please ensure the server is running.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.error || 'Bot configuration error. Check token and bot name.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Ensure Node.js and npm are installed.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Stop bot
  const stopBot = async (botId) => {
    setLoading(true);
    try {
      const response = await api.post('/api/bot/stop', { botId });
      
      if (response.data.success) {
        setSuccess('Bot stopped successfully!');
        fetchRunningBots();
        // Clear any cached data
        setBotLogs([]);
        setSelectedBotId(null);
      }
    } catch (error) {
      console.error('Error stopping bot:', error);
      
      let errorMessage = 'Bot could not be stopped.';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Server connection failed.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show bot logs
  const showBotLogs = async (botId) => {
    setSelectedBotId(botId);
    await fetchBotStatus(botId);
    setLogsDialog(true);
  };

  // Format uptime
  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // Auto-refresh running bots
  useEffect(() => {
    fetchRunningBots();
    const interval = setInterval(fetchRunningBots, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh logs if dialog is open
  useEffect(() => {
    if (logsDialog && selectedBotId) {
      const interval = setInterval(() => {
        fetchBotStatus(selectedBotId);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [logsDialog, selectedBotId]);

  // Cleanup bots on page unload
  useEffect(() => {
    const handleBeforeUnload = async (event) => {
      if (runningBots.length > 0) {
        // Stop all running bots
        for (const bot of runningBots) {
          try {
            await api.post('/api/bot/stop', { botId: bot.id });
          } catch (error) {
            console.error('Error stopping bot on page unload:', error);
          }
        }
      }
    };

    const handleUnload = async () => {
      if (runningBots.length > 0) {
        // Force stop all bots with navigator.sendBeacon for better reliability
        const stopData = JSON.stringify({ 
          action: 'stopAll', 
          botIds: runningBots.map(bot => bot.id) 
        });
        navigator.sendBeacon('/api/bot/cleanup', stopData);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [runningBots]);

  const botId = botConfig.name?.toLowerCase().replace(/\s+/g, '-');
  const currentBotRunning = runningBots.find(bot => bot.botId === botId);

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Computer color="primary" />
        Web Hosting (Run from this Interface)
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Web Hosting:</strong> Your bot runs as long as this web interface stays open. 
          Ideal for quick testing and development. For permanent hosting, download bot files and 
          run on your own server.
        </Typography>
      </Alert>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bot Control
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Bot Name: {botConfig.name || 'Undefined'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Command Count: {botConfig.commands?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Token: 
                  {showToken ? 
                    botConfig.token || 'Not entered' : 
                    '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'
                  }
                  <IconButton size="small" onClick={() => setShowToken(!showToken)}>
                    {showToken ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </Typography>
              </Box>

              {currentBotRunning ? (
                <Box>
                  <Chip 
                    label={`Running (${formatUptime(currentBotRunning.uptime)})`} 
                    color="success" 
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Stop />}
                      onClick={() => stopBot(botId)}
                      disabled={loading}
                    >
                      Stop
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Terminal />}
                      onClick={() => showBotLogs(botId)}
                    >
                      Show Logs
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={startBot}
                  disabled={loading || !botConfig.token || !botConfig.name}
                  fullWidth
                >
                  {loading ? 'Starting...' : 'Start Bot'}
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Running Bots
                </Typography>
                <IconButton onClick={fetchRunningBots}>
                  <Refresh />
                </IconButton>
              </Box>

              {runningBots.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No running bots found
                </Typography>
              ) : (
                <List dense>
                  {runningBots.map((bot) => (
                    <ListItem key={bot.botId}>
                      <ListItemText
                        primary={bot.name}
                        secondary={`Uptime: ${formatUptime(bot.uptime)}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton onClick={() => showBotLogs(bot.botId)}>
                          <Terminal />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => stopBot(bot.botId)}
                        >
                          <Stop />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">
            ⚠️ What You Need to Know About Web Hosting
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Important Limitations:</strong>
            </Typography>
            <ul>
              <li>Bot only works while this web page is open</li>
              <li>Bot stops when browser closes or internet connection is lost</li>
              <li>Bot may be affected when computer goes to sleep mode</li>
              <li>This feature is for testing and development, not recommended for production</li>
            </ul>
          </Alert>
          
          <Alert severity="info">
            <Typography variant="body2">
              <strong>For Permanent Hosting:</strong> It's recommended to download the bot files and run them 
              on your own server, cloud platform, or VPS. This way the bot can run 24/7 
              without interruption.
            </Typography>
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* Bot Logs Dialog */}
      <Dialog 
        open={logsDialog} 
        onClose={() => setLogsDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Bot Logs - {selectedBotId}
        </DialogTitle>
        <DialogContent>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              height: 400, 
              overflow: 'auto', 
              backgroundColor: '#1e1e1e',
              fontFamily: 'monospace'
            }}
          >
            {botLogs.length === 0 ? (
              <Typography color="text.secondary">
                No logs found yet...
              </Typography>
            ) : (
              botLogs.map((log, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography 
                    variant="body2" 
                    component="pre"
                    sx={{ 
                      color: log.type === 'error' ? '#ff6b6b' : '#51cf66',
                      fontSize: '12px',
                      margin: 0
                    }}
                  >
                    [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogsDialog(false)}>
            Kapat
          </Button>
          <Button onClick={() => fetchBotStatus(selectedBotId)}>
            Yenile
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WebBotHost;
