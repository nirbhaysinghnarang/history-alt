// PivotTreeViewer.tsx
"use client"
import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PivotTree from './Components/tree';

// Create custom e-ink theme
const theme = createTheme({
  typography: {
    fontFamily: 'Outfit',
    h1: {
      fontSize: '2rem',
      fontFamily: "Ysabeau SC",

      fontWeight: 400,
      color: '#000000',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.5rem',
      fontFamily: "Ysabeau SC",

      fontWeight: 400,
      color: '#000000',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.25rem',
      fontFamily: "Ysabeau SC",

      fontWeight: 400,
      color: '#333333',
      lineHeight: 1.4,
    },
    body1: {
      fontFamily: 'Outfit',
      color: '#000000',
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: 'Outfit',
      color: '#000000',
      lineHeight: 1.6,
    },
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#555555',
    },
    background: {
      default: '#f5f5f5',
      paper: '#f5f5f5',
    },
    text: {
      primary: '#000000',
      secondary: '#555555',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
          textTransform: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTextField: {
      fontFamily: 'Outfit',
      styleOverrides: {
        fontFamily: 'Outfit',
        root: {
          '& .MuiOutlinedInput-root': {
            fontFamily: 'Outfit',
            borderRadius: 0,
          },
        },
      },
    },
  },
});

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  paddingX: theme.spacing(4),
  paddingY: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const StyledForm = styled('form')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2),
}));

const NodeDetailsPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(3),
  border: '1px solid #000000',
  backgroundColor: '#f5f5f5',
}));

const PivotTreeViewer = () => {
  const [treeData, setTreeData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [ws, setWs] = useState(null);
  const [streamingNode, setStreamingNode] = useState({});
  const [streamingOutcomes, setStreamingOutcomes] = useState({});
  const [streamingNodes, setStreamingNodes] = useState({});

  useEffect(() => {
    const wsUrl = `ws://localhost:3001/ws`;
    const websocket = new WebSocket(wsUrl);
    setWs(websocket);

    websocket.onopen = () => {
      console.log('WebSocket connection established.');
      setError(null);
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case 'tree_update':
          if(message.tree){
            setTreeData(message.tree);

          }
          console.log(message.tree)
          break;
        case 'complete':
          setLoading(false);
          break;
        case 'error':
          setError(message.error);
          break;
      }
    };

    return () => websocket.close();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTreeData(null);
    setSelectedNode(null);

    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'generate',
        prompt,
        maxDepth: 3
      }));
    } else {
      setError('WebSocket not connected.');
      setLoading(false);
    }
  };


  const createPlaceholderNode = () => ({
    year: 'Unknown',
    description: 'Loading...',
    actors: [],
    possible_outcomes: [],
    children: []
  });

  const updateNodeAtPath = useCallback((root, path, newNode) => {
    if (path.length === 0) return newNode;

    const cloneWithNewChild = (node, index, newChild) => ({
      ...node,
      children: [...(node.children || [])].map((child, i) => i === index ? newChild : child)
    });

    const updateLevel = (node, [currentIndex, ...remainingPath]) => {
      if (remainingPath.length === 0) {
        return cloneWithNewChild(node, currentIndex, newNode);
      }

      const children = [...(node.children || [])];
      while (children.length <= currentIndex) {
        children.push(createPlaceholderNode());
      }

      return cloneWithNewChild(
        node,
        currentIndex,
        updateLevel(children[currentIndex], remainingPath)
      );
    };

    return updateLevel(root, path);
  }, []);


  return (
    <ThemeProvider theme={theme}>
      <Container
        maxWidth={false}
        sx={{
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,

          opacity: 0.95,
          py: 4,
        }}
      >
        <StyledPaper>

          <Typography variant="h1" gutterBottom>
            Historical Pivot Exploration
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ color: 'text.secondary' }}>
            Unravel alternate historical narratives by exploring pivotal moments
          </Typography>

          <StyledForm onSubmit={handleSubmit}>
            <TextField
              fullWidth
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a historical turning point..."
              variant="outlined"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#ffffff',
                },
                '& .MuiInputBase-input': {
                  fontFamily: 'Georgia, "Times New Roman", serif',
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
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
                mb: 4,
                '& .MuiAlert-message': {
                  fontFamily: 'Georgia, "Times New Roman", serif',
                },
                backgroundColor: '#ffcccc',
                color: '#000000',
              }}
            >
              {error}
            </Alert>
          )}


          <PivotTree
            treeData={treeData}
            streamingNodes={streamingNodes}
            onNodeClick={setSelectedNode}
          />


        </StyledPaper>
      </Container>
    </ThemeProvider>
  );
};

export default PivotTreeViewer;