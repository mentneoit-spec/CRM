const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_BASE_URL = process.env.GROQ_API_BASE_URL || 'https://api.groq.com/openai/v1';

const groqClient = axios.create({
  baseURL: GROQ_API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${GROQ_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

/**
 * Generate AI HR insights using real Groq AI
 * @param {string} query - User query
 * @param {Array} employees - Employee data for context
 * @param {Array} salaryRecords - Salary records for context
 * @returns {Promise<Object>} AI response
 */
const generateHRInsights = async (query, employees = [], salaryRecords = []) => {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured');
    }

    // Build context from real data
    const context = buildHRContext(employees, salaryRecords);

    // Create sophisticated prompt
    const systemPrompt = `You are an expert HR consultant AI assistant. Analyze the provided HR data and answer questions intelligently.

CURRENT HR DATA:
${context}

Guidelines:
- Provide specific, actionable recommendations based on the data
- Use real numbers and statistics from the data
- Format responses clearly with sections
- Include data-driven insights
- Be professional and concise`;

    const userPrompt = `Based on the HR data above, please help with: ${query}`;

    // Call real Groq API
    const response = await groqClient.post('/chat/completions', {
      model: 'mixtral-8x7b-32768', // Or use 'llama-2-70b-chat' or other Groq models
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.95,
    });

    const aiResponse = response.data.choices[0].message.content;

    return {
      success: true,
      data: {
        query,
        response: aiResponse,
        timestamp: new Date(),
      },
    };
  } catch (error) {
    console.error('Groq AI Error:', error.response?.data || error.message);
    throw {
      success: false,
      error: error.response?.data?.error?.message || 'AI service error',
    };
  }
};

/**
 * Build HR context from employee and salary data
 */
const buildHRContext = (employees = [], salaryRecords = []) => {
  if (employees.length === 0) {
    return 'No employee data available';
  }

  const totalSalary = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
  const avgSalary = totalSalary / employees.length;
  const activeCount = employees.filter(e => e.status === 'Active').length;
  
  // Department breakdown
  const deptBreakdown = {};
  employees.forEach(e => {
    if (!deptBreakdown[e.department]) {
      deptBreakdown[e.department] = { count: 0, totalSalary: 0 };
    }
    deptBreakdown[e.department].count++;
    deptBreakdown[e.department].totalSalary += e.salary || 0;
  });

  // Salary statistics
  const salaries = employees.map(e => e.salary || 0).filter(s => s > 0);
  const maxSalary = Math.max(...salaries);
  const minSalary = Math.min(...salaries);

  // Salary record summary
  const processedSalary = salaryRecords
    .filter(s => s.status === 'Processed')
    .reduce((sum, s) => sum + (s.netSalary || 0), 0);
  const pendingCount = salaryRecords.filter(s => s.status === 'Pending').length;

  const deptDetails = Object.entries(deptBreakdown)
    .map(([dept, data]) => `- ${dept}: ${data.count} employees, Total: ₹${data.totalSalary.toLocaleString()}`)
    .join('\n');

  return `
WORKFORCE OVERVIEW:
- Total Employees: ${employees.length}
- Active Employees: ${activeCount}
- Total Monthly Salary Bill: ₹${totalSalary.toLocaleString()}
- Average Salary: ₹${avgSalary.toLocaleString()}
- Salary Range: ₹${minSalary.toLocaleString()} - ₹${maxSalary.toLocaleString()}

DEPARTMENT BREAKDOWN:
${deptDetails}

SALARY PROCESSING:
- Total Salary Records: ${salaryRecords.length}
- Processed: ₹${processedSalary.toLocaleString()}
- Pending Records: ${pendingCount}

TOP EARNERS:
${employees
  .sort((a, b) => (b.salary || 0) - (a.salary || 0))
  .slice(0, 5)
  .map(e => `- ${e.name} (${e.designation}): ₹${e.salary?.toLocaleString()}`)
  .join('\n')}
`;
};

/**
 * Chat with AI for HR queries
 */
const chatWithAI = async (messages, employees = [], salaryRecords = []) => {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured');
    }

    const context = buildHRContext(employees, salaryRecords);

    const systemMessage = {
      role: 'system',
      content: `You are an experienced HR consultant. Help with HR management, salary analysis, team performance, and employee insights.

CURRENT HR DATA CONTEXT:
${context}

Provide intelligent, data-driven responses based on this context.`,
    };

    const apiMessages = [systemMessage, ...messages];

    const response = await groqClient.post('/chat/completions', {
      model: 'mixtral-8x7b-32768',
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.95,
    });

    const aiMessage = response.data.choices[0].message.content;

    return {
      success: true,
      data: {
        message: aiMessage,
        model: 'Groq Mixtral-8x7b',
        timestamp: new Date(),
      },
    };
  } catch (error) {
    console.error('Groq Chat Error:', error.response?.data || error.message);
    throw {
      success: false,
      error: error.response?.data?.error?.message || 'Chat service error',
    };
  }
};

/**
 * Analyze salary data with AI
 */
const analyzeSalaryData = async (employees = []) => {
  try {
    const prompt = `Analyze this HR salary data and provide insights on:
1. Salary distribution fairness
2. Possible salary adjustment recommendations
3. Department-wise salary comparison
4. Budget optimization suggestions

Be specific with numbers and percentages.`;

    return await generateHRInsights(prompt, employees, []);
  } catch (error) {
    throw error;
  }
};

/**
 * Generate team performance insights
 */
const analyzeTeamPerformance = async (employees = [], salaryRecords = []) => {
  try {
    const prompt = `Based on the employee and salary data, provide analysis on:
1. Team size and structure analysis
2. Department productivity assessment
3. Compensation alignment
4. Recommendations for team optimization`;

    return await generateHRInsights(prompt, employees, salaryRecords);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateHRInsights,
  chatWithAI,
  analyzeSalaryData,
  analyzeTeamPerformance,
  buildHRContext,
};
