import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Avatar,
  Typography,
  Chip,
  Paper,
  Divider,
  Fade,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Send,
  Close,
  SmartToy,
  Refresh,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const AIChatbot = ({ 
  open, 
  onClose, 
  title = 'AI Assistant',
  suggestedQuestions = [],
  onSendMessage,
  role = 'admin',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { type: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      // Prepare conversation history for context
      const history = conversationHistory.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Call backend API
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          role: role,
          conversationHistory: history
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      
      const aiMessage = {
        type: 'ai',
        content: data.message,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      setConversationHistory((prev) => [
        ...prev,
        userMessage,
        aiMessage
      ]);
      
      onSendMessage?.(text);
    } catch (err) {
      console.error('Chat Error:', err);
      setError(err.message || 'Failed to connect to AI service. Please try again.');
      const errorMessage = {
        type: 'ai',
        content: `⚠️ Error: ${err.message}. Please make sure the backend is running.`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (question) => {
    handleSendMessage(question);
  };

  const handleClear = () => {
    setMessages([]);
    setConversationHistory([]);
    setError('');
  };

  const styleColors = {
    admin: { bg: '#667eea20', border: '#667eea', icon: '#667eea' },
    teacher: { bg: '#764ba220', border: '#764ba2', icon: '#764ba2' },
    student: { bg: '#43e97b20', border: '#43e97b', icon: '#43e97b' },
    parent: { bg: '#fa823120', border: '#fa8231', icon: '#fa8231' }
  };

  const colors = styleColors[role] || styleColors.admin;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: `2px solid ${colors.border}`,
          background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
          boxShadow: `0 8px 32px ${colors.border}40`,
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${colors.border}20 0%, ${colors.border}40 100%)`,
          borderBottom: `2px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <SmartToy sx={{ color: colors.icon, fontSize: 28 }} />
          </motion.div>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>
              {title}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.icon }}>
              Powered by Groq AI
            </Typography>
          </Box>
        </Box>
        <Box>
          <IconButton
            size="small"
            onClick={handleClear}
            title="Clear conversation"
            sx={{ color: colors.icon, mr: 1 }}
          >
            <Refresh />
          </IconButton>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: colors.icon }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent
        sx={{
          p: 2,
          height: '400px',
          overflowY: 'auto',
          background: '#fafbfc',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: colors.border,
            borderRadius: '10px',
          },
        }}
      >
        {/* Error Message */}
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}

        {/* Welcome Message */}
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                background: `linear-gradient(135deg, ${colors.border}20 0%, ${colors.border}10 100%)`,
                borderLeft: `4px solid ${colors.border}`,
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              <SmartToy sx={{ color: colors.icon, fontSize: 32, mb: 1 }} />
              <Typography variant="body2" sx={{ color: '#666' }}>
                👋 Hello! I'm your AI Assistant. Ask me anything about {role === 'admin' ? 'analytics and insights' : role === 'teacher' ? 'teaching and class management' : role === 'student' ? 'your studies and learning' : 'your child\'s progress'}.
              </Typography>
            </Paper>
          </motion.div>
        )}

        {/* Messages */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {messages.map((msg, idx) => (
            <Fade in key={idx}>
              <motion.div
                initial={{ opacity: 0, x: msg.type === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                    gap: 1,
                    mb: 1,
                  }}
                >
                  {msg.type === 'ai' && (
                    <Avatar
                      sx={{
                        bgcolor: colors.border,
                        width: 32,
                        height: 32,
                        fontSize: '18px',
                      }}
                    >
                      🤖
                    </Avatar>
                  )}
                  
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      maxWidth: '75%',
                      borderRadius: 2,
                      backgroundColor: msg.type === 'user' ? colors.border : colors.bg,
                      border: `1px solid ${msg.type === 'user' ? colors.border : colors.border}40`,
                      color: msg.type === 'user' ? '#fff' : '#333',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.5,
                      }}
                    >
                      {msg.content}
                    </Typography>
                    {msg.timestamp && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 0.5,
                          opacity: 0.7,
                          fontSize: '11px',
                        }}
                      >
                        {msg.timestamp}
                      </Typography>
                    )}
                  </Paper>

                  {msg.type === 'user' && (
                    <Avatar
                      sx={{
                        bgcolor: colors.border,
                        width: 32,
                        height: 32,
                        fontSize: '18px',
                      }}
                    >
                      👤
                    </Avatar>
                  )}
                </Box>
              </motion.div>
            </Fade>
          ))}
        </Box>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', py: 2 }}
          >
            <CircularProgress size={24} sx={{ color: colors.icon }} />
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: colors.icon }}>
              Thinking...
            </Typography>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </DialogContent>

      {/* Suggested Questions */}
      {messages.length === 0 && suggestedQuestions.length > 0 && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Typography variant="caption" sx={{ color: '#999' }}>
            Suggested questions:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {suggestedQuestions.slice(0, 2).map((q, idx) => (
              <Chip
                key={idx}
                label={q}
                size="small"
                onClick={() => handleSuggestedQuestion(q)}
                sx={{
                  borderColor: colors.border,
                  color: colors.icon,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: colors.bg,
                  }
                }}
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Input */}
      <Divider />
      <Box
        sx={{
          p: 2,
          display: 'flex',
          gap: 1,
          backgroundColor: '#f9fafb',
          borderTop: `1px solid ${colors.border}40`,
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(input);
            }
          }}
          disabled={loading}
          multiline
          maxRows={3}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: '#fff',
              '&:hover fieldset': {
                borderColor: colors.border,
              },
              '&.Mui-focused fieldset': {
                borderColor: colors.border,
              }
            }
          }}
        />
        <IconButton
          onClick={() => handleSendMessage(input)}
          disabled={loading || !input.trim()}
          sx={{
            backgroundColor: colors.border,
            color: '#fff',
            borderRadius: 2,
            '&:hover': {
              backgroundColor: colors.icon,
              transform: 'scale(1.05)',
            },
            transition: 'all 0.2s',
          }}
        >
          <Send />
        </IconButton>
      </Box>
    </Dialog>
  );
};

export default AIChatbot;
