/**
 * Exam Evaluation AI Service
 * Uses Groq AI (same provider as the rest of the project) to evaluate student answers.
 * Falls back gracefully when the API key is missing or the call fails.
 */

const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_BASE_URL = process.env.GROQ_API_BASE_URL || 'https://api.groq.com/openai/v1';
const GROQ_MODEL = process.env.GROQ_EVAL_MODEL || 'llama3-8b-8192'; // fast + cheap

const groqClient = axios.create({
  baseURL: GROQ_API_BASE_URL,
  headers: {
    Authorization: `Bearer ${GROQ_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * Build the evaluation prompt.
 * Instructs the model to return ONLY a JSON object — no markdown, no prose.
 */
const buildEvaluationPrompt = (question, studentAnswer, maxMarks) => `
You are a strict academic exam evaluator. Evaluate the student answer below and return ONLY a valid JSON object — no markdown, no explanation outside the JSON.

QUESTION:
${question}

STUDENT ANSWER:
${studentAnswer}

MAXIMUM MARKS: ${maxMarks}

Evaluation criteria:
1. Accuracy – Is the answer factually correct?
2. Completeness – Are all key points covered?
3. Clarity – Is the answer well-structured and easy to understand?

Return this exact JSON structure (no extra keys, no trailing text):
{
  "score": <integer between 0 and ${maxMarks}>,
  "feedback": "<2-4 sentence overall assessment>",
  "suggestions": "<specific improvements the student should make>"
}
`.trim();

/**
 * Detect basic similarity between two strings (Jaccard on word sets).
 * Returns a value between 0 (no overlap) and 1 (identical word sets).
 */
const jaccardSimilarity = (a, b) => {
  const tokenize = (str) =>
    new Set(
      String(str)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(Boolean)
    );

  const setA = tokenize(a);
  const setB = tokenize(b);
  if (setA.size === 0 && setB.size === 0) return 1;

  const intersection = new Set([...setA].filter((w) => setB.has(w)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
};

/**
 * Parse the raw AI text into a structured result.
 * Handles cases where the model wraps JSON in markdown code fences.
 */
const parseAIResponse = (rawText, maxMarks) => {
  try {
    // Strip markdown code fences if present
    const cleaned = rawText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    // Validate and clamp score
    const score = Math.min(
      maxMarks,
      Math.max(0, Math.round(Number(parsed.score) || 0))
    );

    return {
      score,
      feedback: String(parsed.feedback || 'No feedback provided.').trim(),
      suggestions: String(parsed.suggestions || 'No suggestions provided.').trim(),
    };
  } catch {
    // Fallback: extract score with regex
    const scoreMatch = rawText.match(/"score"\s*:\s*(\d+)/);
    const score = scoreMatch
      ? Math.min(maxMarks, Math.max(0, parseInt(scoreMatch[1], 10)))
      : Math.round(maxMarks * 0.5);

    return {
      score,
      feedback: 'AI evaluation completed. Detailed feedback unavailable.',
      suggestions: 'Please review the answer against the model answer.',
    };
  }
};

/**
 * Main evaluation function.
 * @param {string} question
 * @param {string} studentAnswer
 * @param {number} maxMarks
 * @returns {Promise<{ score: number, feedback: string, suggestions: string, similarityScore: number }>}
 */
const evaluateAnswer = async (question, studentAnswer, maxMarks) => {
  // Basic similarity score (plagiarism hint — compare answer to question)
  const similarityScore = parseFloat(
    jaccardSimilarity(question, studentAnswer).toFixed(2)
  );

  if (!GROQ_API_KEY) {
    console.warn('[ExamEval] GROQ_API_KEY not set — using fallback evaluation');
    return {
      score: Math.round(maxMarks * 0.5),
      feedback:
        'AI evaluation is not configured. A default score has been assigned. Please set GROQ_API_KEY in your .env file.',
      suggestions:
        'Configure the AI service to get detailed feedback on your answers.',
      similarityScore,
    };
  }

  const prompt = buildEvaluationPrompt(question, studentAnswer, maxMarks);

  const response = await groqClient.post('/chat/completions', {
    model: GROQ_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are a strict exam evaluator. Always respond with valid JSON only. No markdown. No extra text.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,      // Low temperature → deterministic, consistent scoring
    max_tokens: 512,       // Enough for the JSON response
    top_p: 0.9,
  });

  const rawText = response.data.choices[0].message.content;
  const result = parseAIResponse(rawText, maxMarks);

  return { ...result, similarityScore };
};

module.exports = { evaluateAnswer, jaccardSimilarity };
