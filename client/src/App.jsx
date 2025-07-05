import React, { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import BotBuilder from './components/BotBuilder';
import Header from './components/Header';
import Footer from './components/Footer';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#5865F2', // Discord Blue
    },
    secondary: {
      main: '#57F287', // Discord Green
    },
    background: {
      default: '#36393f',
      paper: '#40444b',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        
        <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              🤖 BotWeaver
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              The most trusted Discord bot builder
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              🔒 <strong>100% Secure & Self-Hosted</strong> - Your tokens never leave your device • 
              ✅ <strong>Discord ToS Compliant</strong> - Every feature follows Discord's guidelines
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🚀 Easy Setup
                  </Typography>
                  <Typography variant="body2">
                    Create and download your bot with just a few clicks.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🔒 Self-Hosted
                  </Typography>
                  <Typography variant="body2">
                    Your bot runs completely under your control. Your data is safe.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ⚡ Modern & Fast
                  </Typography>
                  <Typography variant="body2">
                    Use the latest features with Discord.js v14.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper elevation={3} sx={{ p: 3 }}>
            <BotBuilder />
          </Paper>
        </Container>

        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default App;
