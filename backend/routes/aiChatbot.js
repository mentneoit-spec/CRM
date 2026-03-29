const express = require('express');
const router = express.Router();

// Groq API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

/**
 * 🤖 AI Chatbot Endpoint
 * POST /api/ai/chat
 * Sends message to Groq API and returns AI response
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, role = 'student', conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
    }

    // Build system prompt based on role
    const systemPrompts = {
      student: `You are a helpful AI tutor assistant for students. Help them understand concepts, solve problems, and learn effectively. 
        - Be encouraging and supportive
        - Explain concepts clearly
        - Ask clarifying questions when needed
        - Suggest study resources
        - Keep responses concise and clear`,
      
      teacher: `You are an AI assistant for teachers. Help with lesson planning, creating questions, analyzing class performance, and communicating with students/parents.
        - Provide practical teaching strategies
        - Help create assessment questions
        - Suggest teaching methods
        - Support student analysis
        - Be professional and detailed`,
      
      admin: `You are an AI assistant for college/school administrators. Help with analytics, decision-making, risk detection, and strategic planning.
        - Provide data-driven insights
        - Identify risks and trends
        - Suggest operational improvements
        - Be factual and analytical
        - Focus on actionable recommendations`,
      
      parent: `You are a supportive AI assistant for parents. Help them understand their child's progress, provide suggestions for improvement, and answer questions about school activities.
        - Be warm and encouraging
        - Explain grades and progress clearly
        - Provide practical improvement tips
        - Be professional yet approachable`
    };

    const systemPrompt = systemPrompts[role] || systemPrompts.student;

    // Prepare conversation history for context
    const messages = [
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Call Groq API
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: parseFloat(process.env.TEMPERATURE) || 0.7,
        max_tokens: parseInt(process.env.MAX_TOKENS) || 2048,
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Groq API Error:', error);
      return res.status(response.status).json({ 
        error: 'AI service error',
        details: error.error?.message || 'Unknown error'
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    res.json({
      success: true,
      message: aiResponse,
      role: role,
      timestamp: new Date().toISOString(),
      usage: {
        prompt_tokens: data.usage?.prompt_tokens || 0,
        completion_tokens: data.usage?.completion_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0
      }
    });

  } catch (error) {
    console.error('Chatbot API Error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      message: error.message
    });
  }
});

/**
 * 📊 Health Check
 * GET /api/ai/health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'AI Service Active',
    groqApiConfigured: !!GROQ_API_KEY,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
