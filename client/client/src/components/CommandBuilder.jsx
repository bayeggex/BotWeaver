import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Chip,
  Grid,
  Alert,
} from '@mui/material';
import { Add, Edit, Delete, Terminal, Security, Timer } from '@mui/icons-material';
import AdvancedCommandBuilder from './AdvancedCommandBuilder';

const CommandBuilder = ({ botConfig, setBotConfig }) => {
  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [currentCommand, setCurrentCommand] = useState({
    name: '',
    description: '',
    response: '',
    ephemeral: false,
    type: 'text', // text, embed, reaction, button, modal, role
    permissions: [],
    cooldown: 0,
    parameters: []
  });

  const handleOpen = (index = -1) => {
    if (index >= 0) {
      setCurrentCommand(botConfig.commands[index]);
      setEditingIndex(index);
    } else {
      setCurrentCommand({
        name: '',
        description: '',
        response: '',
        ephemeral: false,
        type: 'text',
        permissions: [],
        cooldown: 0,
        parameters: []
      });
      setEditingIndex(-1);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentCommand({
      name: '',
      description: '',
      response: '',
      ephemeral: false,
      type: 'text',
      permissions: [],
      cooldown: 0,
      parameters: []
    });
    setEditingIndex(-1);
  };

  const handleSave = () => {
    const newCommands = [...botConfig.commands];
    
    if (editingIndex >= 0) {
      newCommands[editingIndex] = currentCommand;
    } else {
      newCommands.push(currentCommand);
    }
    
    setBotConfig(prev => ({
      ...prev,
      commands: newCommands
    }));
    
    handleClose();
  };

  const handleDelete = (index) => {
    const newCommands = botConfig.commands.filter((_, i) => i !== index);
    setBotConfig(prev => ({
      ...prev,
      commands: newCommands
    }));
  };

  const handleCommandChange = (field) => (event) => {
    setCurrentCommand(prev => ({
      ...prev,
      [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
    }));
  };

  const isValid = currentCommand.name.trim() !== '' && 
    (currentCommand.type === 'text' ? currentCommand.response.trim() !== '' : true);

  const getCommandTypeLabel = (type) => {
    const types = {
      text: 'Text',
      embed: 'Embed',
      reaction: 'Reaction',
      role: 'Role Action',
      button: 'Button',
      modal: 'Modal'
    };
    return types[type] || type;
  };

  const getCommandPreview = (command) => {
    switch (command.type) {
      case 'embed':
        return command.embedTitle || command.embedDescription || 'Embed message';
      case 'role':
        return `Role ${command.roleAction || 'action'}: ${command.roleTarget || 'target role'}`;
      case 'reaction':
        return `Reaction: ${command.reactions || 'emojis'}`;
      case 'button':
        return `Buttons: ${command.buttonLabels || 'button labels'}`;
      default:
        return command.response || 'Response not set';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Bot Commands
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Add Command
        </Button>
      </Box>

      {botConfig.commands.length === 0 ? (          <Card sx={{ textAlign: 'center', py: 4 }}>
            <CardContent>
              <Terminal sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No commands added yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start by adding commands for your bot
              </Typography>
            </CardContent>
          </Card>
      ) : (
        <Grid container spacing={2}>
          {botConfig.commands.map((command, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" component="div">
                        /{command.name}
                      </Typography>
                      <Chip 
                        label={getCommandTypeLabel(command.type)} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {command.ephemeral && (
                        <Chip label="Gizli" size="small" color="secondary" />
                      )}
                      {command.permissions && command.permissions.length > 0 && (
                        <Chip 
                          icon={<Security />} 
                          label={`${command.permissions.length} izin`} 
                          size="small" 
                          color="warning" 
                        />
                      )}
                      {command.cooldown > 0 && (
                        <Chip 
                          icon={<Timer />} 
                          label={`${command.cooldown}s`} 
                          size="small" 
                          color="info" 
                        />
                      )}
                    </Box>
                  </Box>
                  
                  {command.description && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {command.description}
                    </Typography>
                  )}
                  
                  {command.parameters && command.parameters.length > 0 && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Parametreler: 
                      </Typography>
                      {command.parameters.map((param, paramIndex) => (
                        <Chip 
                          key={paramIndex}
                          label={`${param.name} (${param.type})`}
                          size="small"
                          variant="outlined"
                          sx={{ ml: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                  
                  <Typography variant="body2" sx={{ 
                    backgroundColor: 'rgba(88, 101, 242, 0.1)', 
                    p: 1, 
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    wordBreak: 'break-word'
                  }}>
                    {getCommandPreview(command)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton size="small" onClick={() => handleOpen(index)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(index)}>
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingIndex >= 0 ? 'Edit Command' : 'Add New Command'}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <AdvancedCommandBuilder
            currentCommand={currentCommand}
            setCurrentCommand={setCurrentCommand}
            onSave={handleSave}
            onCancel={handleClose}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CommandBuilder;
