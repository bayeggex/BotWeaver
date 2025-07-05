import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Grid,
} from '@mui/material';
import {
  FileDownload,
  FileUpload,
  Save,
  Restore,
} from '@mui/icons-material';
import api from '../utils/api';

const ConfigManager = ({ botConfig, setBotConfig }) => {
  const [exportDialog, setExportDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);
  const [importData, setImportData] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleExportConfig = async () => {
    try {
      setLoading(true);
      const response = await api.post('/bot/export', { botConfig });
      
      // Create download link
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${botConfig.name || 'bot'}-config.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setMessage({ type: 'success', text: 'Configuration exported successfully!' });
      setExportDialog(false);
    } catch (error) {
      console.error('Export error:', error);
      setMessage({ type: 'error', text: 'Failed to export configuration' });
    } finally {
      setLoading(false);
    }
  };

  const handleImportConfig = async () => {
    try {
      setLoading(true);
      
      if (!importData.trim()) {
        setMessage({ type: 'error', text: 'Please paste configuration data' });
        return;
      }

      let configData;
      try {
        configData = JSON.parse(importData);
      } catch (parseError) {
        setMessage({ type: 'error', text: 'Invalid JSON format' });
        return;
      }

      const response = await api.post('/bot/import', { configData });
      
      if (response.data.success) {
        setBotConfig(response.data.config);
        setMessage({ type: 'success', text: 'Configuration imported successfully!' });
        setImportDialog(false);
        setImportData('');
      }
    } catch (error) {
      console.error('Import error:', error);
      setMessage({ type: 'error', text: 'Failed to import configuration' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImportData(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Configuration Management
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Save your bot configuration as JSON or load a previously saved configuration.
          </Typography>
          
          {message.text && (
            <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
              {message.text}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={() => setExportDialog(true)}
                fullWidth
                disabled={!botConfig.name}
              >
                Export Configuration
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                startIcon={<FileUpload />}
                onClick={() => setImportDialog(true)}
                fullWidth
              >
                Import Configuration
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Export Bot Configuration
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            This will download a JSON file containing your bot configuration. 
            The bot token will be removed for security.
          </Typography>
          <Alert severity="info">
            You can use this file to backup your configuration or share your bot setup with others.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExportConfig} 
            variant="contained" 
            startIcon={<Save />}
            disabled={loading}
          >
            {loading ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialog} onClose={() => setImportDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Import Bot Configuration
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Upload a JSON configuration file or paste the configuration data below.
          </Typography>
          
          <Button
            variant="outlined"
            component="label"
            startIcon={<FileUpload />}
            sx={{ mb: 2 }}
          >
            Choose File
            <input
              type="file"
              accept=".json"
              hidden
              onChange={handleFileUpload}
            />
          </Button>
          
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <TextField
            label="Configuration JSON"
            multiline
            rows={8}
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            fullWidth
            placeholder="Paste your configuration JSON here..."
            helperText="Paste the content of a previously exported configuration file"
          />

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Important:</strong> This will replace your current configuration. 
              You'll need to add your bot token manually after import.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImportConfig} 
            variant="contained" 
            startIcon={<Restore />}
            disabled={loading || !importData.trim()}
          >
            {loading ? 'Importing...' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConfigManager;
