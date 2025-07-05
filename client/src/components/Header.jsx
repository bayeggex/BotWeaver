import React from 'react';
import { AppBar, Toolbar, Typography, Box, Chip, Button } from '@mui/material';
import { SmartToy, Help, GitHub, Security } from '@mui/icons-material';

const Header = () => {
  const handleHelpClick = () => {
    window.open('https://github.com/bayeggex/BotWeaver/wiki', '_blank');
  };

  const handleGitHubClick = () => {
    window.open('https://github.com/bayeggex/BotWeaver', '_blank');
  };

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <img 
          src="/BotWeaver.svg" 
          alt="BotWeaver" 
          style={{ height: '32px', marginRight: '16px' }}
        />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          BotWeaver
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip 
            label="Self-Hosted" 
            color="secondary" 
            size="small" 
            title="Runs entirely on your own server"
            icon={<Security sx={{ fontSize: '16px !important' }} />}
          />
          <Chip 
            label="No-Code" 
            color="primary" 
            size="small" 
            title="Build bots without coding knowledge"
          />
          <Chip 
            label="v1.0" 
            variant="outlined" 
            size="small" 
            sx={{ color: 'text.secondary' }}
          />
          <Button
            size="small"
            startIcon={<Help />}
            onClick={handleHelpClick}
            sx={{ color: 'white', textTransform: 'none' }}
          >
            Help
          </Button>
          <Button
            size="small"
            startIcon={<GitHub />}
            onClick={handleGitHubClick}
            sx={{ color: 'white', textTransform: 'none' }}
          >
            GitHub
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
