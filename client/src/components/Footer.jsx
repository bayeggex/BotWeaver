import React from 'react';
import { Box, Typography, Link, Container, Chip } from '@mui/material';
import { Security, Verified } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[900],
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Chip 
              icon={<Security />}
              label="Discord ToS Compliant" 
              color="success" 
              size="small" 
              variant="outlined"
            />
            <Chip 
              icon={<Verified />}
              label="Open Source" 
              color="primary" 
              size="small" 
              variant="outlined"
            />
            <Chip 
              label="Self-Hosted Security" 
              color="secondary" 
              size="small" 
              variant="outlined"
            />
          </Box>
          <Typography variant="body2" color="text.secondary" align="center">
            {'BotWeaver © '}
            {new Date().getFullYear()}
            {'. Self-hosted & open source Discord bot builder. '}
            <Link color="inherit" href="https://github.com/bayeggex/BotWeaver">
              GitHub
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
