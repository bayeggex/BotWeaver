import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  OutlinedInput,
  Button,
  Card,
  CardContent,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Grid,
  Slider,
} from '@mui/material';
import {
  ExpandMore,
  Add,
  Delete,
  Security,
  Timer,
  Code,
  Message,
  TouchApp,
} from '@mui/icons-material';

const COMMAND_TYPES = [
  { value: 'text', label: 'Text Response', icon: <Message /> },
  { value: 'embed', label: 'Embed Message', icon: <Code /> },
  { value: 'reaction', label: 'Add Reaction', icon: <TouchApp /> },
  { value: 'role', label: 'Give/Remove Role', icon: <Security /> },
  { value: 'button', label: 'Button Menu', icon: <TouchApp /> },
  { value: 'modal', label: 'Modal Form', icon: <Code /> },
];

const PERMISSIONS = [
  'MANAGE_MESSAGES',
  'MANAGE_ROLES',
  'KICK_MEMBERS',
  'BAN_MEMBERS',
  'MANAGE_CHANNELS',
  'MANAGE_GUILD',
  'ADMINISTRATOR',
];

const PARAMETER_TYPES = [
  { value: 'string', label: 'Text' },
  { value: 'integer', label: 'Number' },
  { value: 'user', label: 'User' },
  { value: 'channel', label: 'Channel' },
  { value: 'role', label: 'Role' },
  { value: 'boolean', label: 'Yes/No' },
];

const AdvancedCommandBuilder = ({ currentCommand, setCurrentCommand, onSave, onCancel }) => {
  const [embedFields, setEmbedFields] = useState([{ name: '', value: '', inline: false }]);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setCurrentCommand(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionChange = (event) => {
    setCurrentCommand(prev => ({
      ...prev,
      permissions: event.target.value
    }));
  };

  const addParameter = () => {
    const newParam = {
      name: '',
      description: '',
      type: 'string',
      required: true
    };
    setCurrentCommand(prev => ({
      ...prev,
      parameters: [...prev.parameters, newParam]
    }));
  };

  const updateParameter = (index, field, value) => {
    const newParams = [...currentCommand.parameters];
    newParams[index] = { ...newParams[index], [field]: value };
    setCurrentCommand(prev => ({
      ...prev,
      parameters: newParams
    }));
  };

  const removeParameter = (index) => {
    const newParams = currentCommand.parameters.filter((_, i) => i !== index);
    setCurrentCommand(prev => ({
      ...prev,
      parameters: newParams
    }));
  };

  const addEmbedField = () => {
    setEmbedFields([...embedFields, { name: '', value: '', inline: false }]);
  };

  const updateEmbedField = (index, field, value) => {
    const newFields = [...embedFields];
    newFields[index] = { ...newFields[index], [field]: value };
    setEmbedFields(newFields);
    
    // Update command with embed data
    setCurrentCommand(prev => ({
      ...prev,
      embedFields: newFields
    }));
  };

  const removeEmbedField = (index) => {
    const newFields = embedFields.filter((_, i) => i !== index);
    setEmbedFields(newFields);
    setCurrentCommand(prev => ({
      ...prev,
      embedFields: newFields
    }));
  };

  const renderTypeSpecificFields = () => {
    switch (currentCommand.type) {
      case 'embed':
        return (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Embed Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Embed Title"
                  value={currentCommand.embedTitle || ''}
                  onChange={(e) => handleChange('embedTitle')(e)}
                  fullWidth
                />
                <TextField
                  label="Embed Description"
                  value={currentCommand.embedDescription || ''}
                  onChange={(e) => handleChange('embedDescription')(e)}
                  multiline
                  rows={3}
                  fullWidth
                />
                <TextField
                  label="Embed Rengi (Hex)"
                  value={currentCommand.embedColor || '#5865F2'}
                  onChange={(e) => handleChange('embedColor')(e)}
                  placeholder="#5865F2"
                  fullWidth
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Embed Fields</Typography>
                  <Button startIcon={<Add />} onClick={addEmbedField}>
                    Add Field
                  </Button>
                </Box>
                
                {embedFields.map((field, index) => (
                  <Card key={index} variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <TextField
                            label="Field Name"
                            value={field.name}
                            onChange={(e) => updateEmbedField(index, 'name', e.target.value)}
                            size="small"
                            sx={{ flex: 1 }}
                          />
                          <FormControlLabel
                            control={
                              <Switch
                                checked={field.inline}
                                onChange={(e) => updateEmbedField(index, 'inline', e.target.checked)}
                              />
                            }
                            label="Inline"
                          />
                          <IconButton onClick={() => removeEmbedField(index)} color="error">
                            <Delete />
                          </IconButton>
                        </Box>
                        <TextField
                          label="Field Value"
                          value={field.value}
                          onChange={(e) => updateEmbedField(index, 'value', e.target.value)}
                          multiline
                          rows={2}
                          fullWidth
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        );

      case 'role':
        return (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Role Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Role Action</InputLabel>
                  <Select
                    value={currentCommand.roleAction || 'add'}
                    onChange={(e) => handleChange('roleAction')(e)}
                  >
                    <MenuItem value="add">Give Role</MenuItem>
                    <MenuItem value="remove">Remove Role</MenuItem>
                    <MenuItem value="toggle">Toggle Role</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Role ID or Name"
                  value={currentCommand.roleTarget || ''}
                  onChange={(e) => handleChange('roleTarget')(e)}
                  placeholder="Moderator or 123456789"
                  fullWidth
                />
                <TextField
                  label="Success Message"
                  value={currentCommand.roleSuccessMessage || ''}
                  onChange={(e) => handleChange('roleSuccessMessage')(e)}
                  placeholder="Role successfully given!"
                  fullWidth
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        );

      case 'reaction':
        return (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Reaction Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Emojis (comma separated)"
                  value={currentCommand.reactions || ''}
                  onChange={(e) => handleChange('reactions')(e)}
                  placeholder="👍,👎,❤️"
                  fullWidth
                  helperText="Emojis to add to the message"
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        );

      case 'button':
        return (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Button Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                label="Button Labels (comma separated)"
                value={currentCommand.buttonLabels || ''}
                onChange={(e) => handleChange('buttonLabels')(e)}
                placeholder="Accept,Reject,More Info"
                fullWidth
                helperText="Labels for the buttons to display"
              />
            </AccordionDetails>
          </Accordion>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Basic Information */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Basic Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Command Name"
                value={currentCommand.name}
                onChange={handleChange('name')}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Command Type</InputLabel>
                <Select
                  value={currentCommand.type}
                  onChange={handleChange('type')}
                >
                  {COMMAND_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={currentCommand.description}
                onChange={handleChange('description')}
                fullWidth
              />
            </Grid>
            {currentCommand.type === 'text' && (
              <Grid item xs={12}>
                <TextField
                  label="Bot Response"
                  value={currentCommand.response}
                  onChange={handleChange('response')}
                  required
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Type-Specific Settings */}
      {renderTypeSpecificFields()}

      {/* Parametreler */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Code />
            <Typography variant="h6">Command Parameters</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Parameters to collect from users
              </Typography>
              <Button startIcon={<Add />} onClick={addParameter} size="small">
                Add Parameter
              </Button>
            </Box>
            
            {currentCommand.parameters.map((param, index) => (
              <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <TextField
                        label="Parameter Name"
                        value={param.name}
                        onChange={(e) => updateParameter(index, 'name', e.target.value)}
                        size="small"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={param.type}
                          onChange={(e) => updateParameter(index, 'type', e.target.value)}
                        >
                          {PARAMETER_TYPES.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Description"
                        value={param.description}
                        onChange={(e) => updateParameter(index, 'description', e.target.value)}
                        size="small"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={param.required}
                              onChange={(e) => updateParameter(index, 'required', e.target.checked)}
                            />
                          }
                          label="Zorunlu"
                        />
                        <IconButton onClick={() => removeParameter(index)} color="error">
                          <Delete />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Advanced Settings */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security />
            <Typography variant="h6">Advanced Settings</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Required Permissions</InputLabel>
                <Select
                  multiple
                  value={currentCommand.permissions}
                  onChange={handlePermissionChange}
                  input={<OutlinedInput label="Required Permissions" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {PERMISSIONS.map((permission) => (
                    <MenuItem key={permission} value={permission}>
                      {permission}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box>
                <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Timer />
                  Cooldown: {currentCommand.cooldown} saniye
                </Typography>
                <Slider
                  value={currentCommand.cooldown}
                  onChange={(e, value) => handleChange('cooldown')({ target: { value } })}
                  min={0}
                  max={300}
                  step={5}
                  marks={[
                    { value: 0, label: '0s' },
                    { value: 60, label: '1m' },
                    { value: 300, label: '5m' }
                  ]}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentCommand.ephemeral}
                    onChange={handleChange('ephemeral')}
                  />
                }
                label="Private response (Only the command user can see)"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Save/Cancel Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={!currentCommand.name.trim()}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default AdvancedCommandBuilder;
