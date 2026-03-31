const {
  generateHRInsights,
  chatWithAI,
  analyzeSalaryData,
  analyzeTeamPerformance,
} = require('../services/groq-ai-service');
const prisma = require('../lib/prisma');

/**
 * Generate AI HR insights based on query
 * POST /api/ai/hr-insights
 */
const getHRInsights = async (req, res) => {
  try {
    const { query, collegeId } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required',
      });
    }

    // Fetch real data from database
    const [employees, salaryRecords] = await Promise.all([
      prisma.employee.findMany({
        where: { collegeId },
        select: {
          id: true,
          name: true,
          email: true,
          employeeId: true,
          department: true,
          designation: true,
          salary: true,
          status: true,
          dateOfJoining: true,
        },
      }),
      prisma.employeeSalary.findMany({
        where: { collegeId },
        select: {
          id: true,
          month: true,
          year: true,
          baseSalary: true,
          allowances: true,
          deductions: true,
          netSalary: true,
          status: true,
        },
        take: 100, // Limit to last 100 records
      }),
    ]);

    // Call Groq AI with real data
    const aiResponse = await generateHRInsights(query, employees, salaryRecords);

    res.status(200).json({
      success: true,
      data: {
        query,
        insights: aiResponse.data.response,
        dataUsed: {
          employeeCount: employees.length,
          salaryRecordsCount: salaryRecords.length,
        },
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('HR Insights Error:', error);
    res.status(500).json({
      success: false,
      error: error.error || 'Failed to generate insights',
    });
  }
};

/**
 * Chat with AI HR Assistant
 * POST /api/ai/chat
 */
const chatWithHRAI = async (req, res) => {
  try {
    const { messages, collegeId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: 'Messages array is required',
      });
    }

    // Fetch real data
    const [employees, salaryRecords] = await Promise.all([
      prisma.employee.findMany({
        where: { collegeId },
        select: {
          id: true,
          name: true,
          department: true,
          designation: true,
          salary: true,
          status: true,
        },
      }),
      prisma.employeeSalary.findMany({
        where: { collegeId },
        select: {
          id: true,
          netSalary: true,
          status: true,
          month: true,
          year: true,
        },
        take: 50,
      }),
    ]);

    // Format messages for Groq API
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }));

    // Call Groq AI
    const aiResponse = await chatWithAI(formattedMessages, employees, salaryRecords);

    res.status(200).json({
      success: true,
      data: aiResponse.data,
    });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({
      success: false,
      error: error.error || 'Chat failed',
    });
  }
};

/**
 * Analyze salary data with AI
 * POST /api/ai/analyze-salary
 */
const analyzeSalary = async (req, res) => {
  try {
    const { collegeId } = req.body;

    // Fetch employee data
    const employees = await prisma.employee.findMany({
      where: { collegeId },
      select: {
        id: true,
        name: true,
        department: true,
        designation: true,
        salary: true,
        status: true,
      },
    });

    if (employees.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No employees found for analysis',
      });
    }

    // Get AI analysis
    const analysis = await analyzeSalaryData(employees);

    res.status(200).json({
      success: true,
      data: {
        analysis: analysis.data.response,
        employeeCount: employees.length,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Salary Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: error.error || 'Salary analysis failed',
    });
  }
};

/**
 * Analyze team performance with AI
 * POST /api/ai/analyze-team
 */
const analyzeTeam = async (req, res) => {
  try {
    const { collegeId } = req.body;

    // Fetch data
    const [employees, salaryRecords] = await Promise.all([
      prisma.employee.findMany({
        where: { collegeId },
        select: {
          id: true,
          name: true,
          department: true,
          designation: true,
          salary: true,
          status: true,
          dateOfJoining: true,
        },
      }),
      prisma.employeeSalary.findMany({
        where: { collegeId },
        select: {
          id: true,
          baseSalary: true,
          netSalary: true,
          status: true,
          month: true,
          year: true,
        },
        take: 100,
      }),
    ]);

    if (employees.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No employees found for analysis',
      });
    }

    // Get AI analysis
    const analysis = await analyzeTeamPerformance(employees, salaryRecords);

    res.status(200).json({
      success: true,
      data: {
        analysis: analysis.data.response,
        teamSize: employees.length,
        departments: Array.from(new Set(employees.map(e => e.department))).length,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Team Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: error.error || 'Team analysis failed',
    });
  }
};

/**
 * Get salary recommendations with AI
 * POST /api/ai/salary-recommendations
 */
const getSalaryRecommendations = async (req, res) => {
  try {
    const { collegeId } = req.body;

    const employees = await prisma.employee.findMany({
      where: { collegeId },
      select: {
        id: true,
        name: true,
        employeeId: true,
        department: true,
        designation: true,
        salary: true,
        dateOfJoining: true,
        status: true,
      },
      orderBy: { salary: 'desc' },
    });

    if (employees.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No employees found',
      });
    }

    const prompt = `Based on the following employee data, provide detailed salary increment recommendations:

${employees
  .slice(0, 20)
  .map(
    e =>
      `- ${e.name} (${e.designation}): Current ₹${e.salary} in ${e.department}`
  )
  .join('\n')}

Provide:
1. Top 5 candidates for salary increment with reasons
2. Recommended increment percentage for each
3. Budget impact analysis
4. Timeline for implementation`;

    const recommendations = await generateHRInsights(prompt, employees, []);

    res.status(200).json({
      success: true,
      data: {
        recommendations: recommendations.data.response,
        employeeCount: employees.length,
        avgSalary: Math.round(
          employees.reduce((sum, e) => sum + e.salary, 0) / employees.length
        ),
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Salary Recommendations Error:', error);
    res.status(500).json({
      success: false,
      error: error.error || 'Failed to generate recommendations',
    });
  }
};

module.exports = {
  getHRInsights,
  chatWithHRAI,
  analyzeSalary,
  analyzeTeam,
  getSalaryRecommendations,
};
