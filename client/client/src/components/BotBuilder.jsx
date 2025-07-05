import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import BotConfig from './BotConfig';
import CommandBuilder from './CommandBuilder';
import Preview from './Preview';
import ConfigManager from './ConfigManager';
import api from '../utils/api';

const steps = ['Bot Settings', 'Commands', 'Preview & Download', 'Config Manager'];

const BotBuilder = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [botConfig, setBotConfig] = useState({
    name: '',
    description: '',
    token: '',
    prefix: '!',
    status: 'online',
    activity: {
      type: 'PLAYING',
      name: '',
      url: ''
    },
    useSlashCommands: true,
    allowedRoles: '',
    allowedChannels: '',
    dmCommands: false,
    logCommands: true,
    errorChannelId: '',
    ownerId: '',
    autoReconnect: true,
    deleteCommands: false,
    commands: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setBotConfig({
      name: '',
      description: '',
      token: '',
      prefix: '!',
      status: 'online',
      activity: {
        type: 'PLAYING',
        name: '',
        url: ''
      },
      useSlashCommands: true,
      allowedRoles: '',
      allowedChannels: '',
      dmCommands: false,
      logCommands: true,
      errorChannelId: '',
      ownerId: '',
      autoReconnect: true,
      deleteCommands: false,
      commands: []
    });
    setError('');
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        return botConfig.name.trim() !== '' && botConfig.token.trim() !== '';
      case 1:
        return botConfig.commands.length > 0;
      default:
        return true;
    }
  };

  const handleDownloadBot = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/api/bot/generate', {
        botConfig
      }, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${botConfig.name}-bot.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download error:', error);
      
      let errorMessage = 'Error occurred while downloading the bot.';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Server connection failed. Please ensure the server is running.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Bot configuration error. Please check all fields.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <BotConfig
            botConfig={botConfig}
            setBotConfig={setBotConfig}
          />
        );
      case 1:
        return (
          <CommandBuilder
            botConfig={botConfig}
            setBotConfig={setBotConfig}
          />
        );
      case 2:
        return (
          <Preview
            botConfig={botConfig}
            onDownload={handleDownloadBot}
            loading={loading}
          />
        );
      case 3:
        return (
          <ConfigManager
            botConfig={botConfig}
            setBotConfig={setBotConfig}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={1} sx={{ p: 3, minHeight: '400px' }}>
        {getStepContent(activeStep)}
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
        <Button
          color="inherit"
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        
        {activeStep === steps.length - 1 ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={handleReset}>
              Start Over
            </Button>
          </Box>
        ) : activeStep === steps.length - 2 ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={handleReset}>
              Start Over
            </Button>
            <Button
              variant="contained"
              onClick={handleDownloadBot}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Downloading...' : 'Download Bot'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleNext}
            >
              Manage Config
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!validateStep()}
          >
            {activeStep === steps.length - 3 ? 'Finish' : 'Next'}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default BotBuilder;
