// PivotTreeViewer.tsx
"use client"
import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PivotTree from './Components/tree';

const theme = createTheme({
  typography: {
    fontFamily: 'Crimson Pro',
    h1: {
      fontSize: '2rem',
      fontFamily: "Crimson Pro",
      fontWeight: 400,
      color: '#000000',
      lineHeight: 1.2,
    },
    body1: {
      fontFamily: 'Crimson Pro',
      color: '#000000',
      lineHeight: 1.6,
    },
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
    },
    background: {
      default: '#f5f5f5',
      paper: '#f5f5f5',
    },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            fontFamily: 'Crimson Pro',
            borderRadius: 0,
            backgroundColor: '#ffffff',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'none',
        },
      },
    },
  },
});

const FullscreenContainer = styled('div')({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
});

const HeaderOverlay = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 10,
  padding: '1rem 2rem',
  background: 'linear-gradient(to bottom, rgba(245, 245, 245, 0.95), rgba(245, 245, 245, 0.85))',
});

const TreeContainer = styled('div')({
  flexGrow: 1,
  width: '100%',
  height: '100vh',
});

const StyledForm = styled('form')({
  display: 'flex',
  gap: '1rem',
  marginTop: '0.5rem',
});

const PivotTreeViewer = () => {
  const [treeData, setTreeData] = useState(null);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const wsUrl = `wss://hist-alt-be.onrender.com/ws`;
    const websocket = new WebSocket(wsUrl);
    setWs(websocket);

    websocket.onopen = () => {
      console.log('WebSocket connection established.');
      setError(null);
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'tree_update' && message.tree) {
        setTreeData(message.tree);
      } else if (message.type === 'complete') {
        setLoading(false);
      } else if (message.type === 'error') {
        setError(message.error);
        setLoading(false);
      }
    };

    return () => websocket.close();
  }, []);

  const handleInputChange = useCallback((e) => {
    setPrompt(e.target.value);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setTreeData(null);

    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'generate',
        prompt: prompt.trim(),
        maxDepth: 3
      }));
    } else {
      setError('WebSocket not connected.');
      setLoading(false);
    }
  }, [prompt, ws]);

  return (
    <ThemeProvider theme={theme}>
      <FullscreenContainer>
        <HeaderOverlay>
          <Typography variant="h1" gutterBottom>
            Historical Pivot Exploration
          </Typography>
          <StyledForm onSubmit={handleSubmit}>
            <TextField
              fullWidth
              value={prompt}
              onChange={handleInputChange}
              placeholder="Enter a historical turning point..."
              required
              disabled={loading}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !prompt.trim()}
              sx={{
                minWidth: 200,
                backgroundColor: '#000000',
                '&:hover': {
                  backgroundColor: '#333333',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Pivot Tree'}
            </Button>
          </StyledForm>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                backgroundColor: '#ffcccc',
                color: '#000000',
              }}
            >
              {error}
            </Alert>
          )}
        </HeaderOverlay>
        <TreeContainer>
          <PivotTree treeData={treeData} />
        </TreeContainer>
      </FullscreenContainer>
    </ThemeProvider>
  );
};

export default PivotTreeViewer;