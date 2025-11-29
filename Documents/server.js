require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Load locales
const locales = {
  ja: JSON.parse(fs.readFileSync(path.join(__dirname, 'locales', 'ja.json'), 'utf8')),
  en: JSON.parse(fs.readFileSync(path.join(__dirname, 'locales', 'en.json'), 'utf8'))
};

// Load challenges
const challenges = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'challenges.json'), 'utf8'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session-like language storage (simplified for prototype)
const userSessions = {};

// Middleware for language detection
app.use((req, res, next) => {
  const queryLang = req.query.lang;
  const browserLang = req.headers['accept-language']?.startsWith('en') ? 'en' : 'ja';
  const lang = queryLang || browserLang;
  req.lang = ['ja', 'en'].includes(lang) ? lang : 'ja';
  res.locals.lang = req.lang;
  res.locals.t = locales[req.lang];
  next();
});

// Routes
app.get('/', (req, res) => {
  res.render('index', { 
    challenges: challenges.slice(0, 3),
    leaderboard: getLeaderboard()
  });
});

app.get('/challenges', (req, res) => {
  res.render('challenges', { 
    challenges: challenges 
  });
});

app.get('/challenge/:id', (req, res) => {
  const challenge = challenges.find(c => c.id === parseInt(req.params.id));
  if (!challenge) {
    return res.status(404).send('Challenge not found');
  }
  res.render('challenge-detail', { 
    challenge 
  });
});

app.get('/leaderboard', (req, res) => {
  res.render('leaderboard', { 
    leaderboard: getLeaderboard() 
  });
});

app.get('/profile', (req, res) => {
  const userId = 'demo-user'; // Prototype: no authentication
  const userProgress = getUserProgress(userId);
  res.render('profile', { 
    user: userProgress 
  });
});

// API Routes
app.post('/api/submit-prompt', async (req, res) => {
  try {
    const { challengeId, prompt } = req.body;
    const challenge = challenges.find(c => c.id === parseInt(challengeId));
    
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Evaluate prompt using GitHub Models API
    const evaluation = await evaluatePrompt(prompt, challenge, req.lang);
    
    // Save progress (in-memory for prototype)
    saveProgress('demo-user', challengeId, evaluation);
    
    res.json(evaluation);
  } catch (error) {
    console.error('Error evaluating prompt:', error);
    res.status(500).json({ error: 'Evaluation failed', details: error.message });
  }
});

// Helper Functions
async function evaluatePrompt(userPrompt, challenge, lang) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN not configured in .env file');
  }

  // Build evaluation prompt
  const systemPrompt = lang === 'ja' 
    ? `あなたはプロンプトエンジニアリングの評価者です。ユーザーが提出したプロンプトを以下の基準で評価してください：
1. 課題の要件を満たしているか (0-30点)
2. プロンプトの明確さと具体性 (0-30点)
3. 技術的な適切さ (0-20点)
4. 創造性と工夫 (0-20点)

合計100点満点で採点し、以下のJSON形式で返してください：
{
  "score": <0-100の数値>,
  "feedback": "<具体的なフィードバック>",
  "strengths": ["<良かった点1>", "<良かった点2>"],
  "improvements": ["<改善点1>", "<改善点2>"]
}`
    : `You are a prompt engineering evaluator. Evaluate the submitted prompt based on these criteria:
1. Meets challenge requirements (0-30 points)
2. Clarity and specificity (0-30 points)
3. Technical appropriateness (0-20 points)
4. Creativity and ingenuity (0-20 points)

Rate out of 100 total points and return in this JSON format:
{
  "score": <number 0-100>,
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}`;

  const evaluationPrompt = lang === 'ja'
    ? `課題: ${challenge.title.ja}\n説明: ${challenge.description.ja}\n目標: ${challenge.goal.ja}\n\nユーザーのプロンプト:\n${userPrompt}\n\n上記のプロンプトを評価してください。`
    : `Challenge: ${challenge.title.en}\nDescription: ${challenge.description.en}\nGoal: ${challenge.goal.en}\n\nUser's prompt:\n${userPrompt}\n\nPlease evaluate the above prompt.`;

  try {
    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: evaluationPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub Models API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Try to parse JSON response
    let evaluation;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || [null, content];
      evaluation = JSON.parse(jsonMatch[1] || content);
    } catch (e) {
      // Fallback if JSON parsing fails
      evaluation = {
        score: 50,
        feedback: content,
        strengths: [lang === 'ja' ? 'プロンプトを提出しました' : 'Submitted a prompt'],
        improvements: [lang === 'ja' ? '評価形式の解析に失敗しました' : 'Failed to parse evaluation format']
      };
    }

    // Calculate XP (experience points)
    evaluation.xp = Math.floor(evaluation.score / 2);
    evaluation.timestamp = new Date().toISOString();
    
    return evaluation;
  } catch (error) {
    console.error('GitHub Models API call failed:', error);
    throw error;
  }
}

// In-memory storage for prototype
const userProgress = {
  'demo-user': {
    userId: 'demo-user',
    username: 'DemoUser',
    level: 1,
    totalXP: 0,
    completedChallenges: [],
    submissions: []
  }
};

function saveProgress(userId, challengeId, evaluation) {
  if (!userProgress[userId]) {
    userProgress[userId] = {
      userId,
      username: 'User' + userId,
      level: 1,
      totalXP: 0,
      completedChallenges: [],
      submissions: []
    };
  }

  const user = userProgress[userId];
  user.submissions.push({
    challengeId,
    score: evaluation.score,
    xp: evaluation.xp,
    timestamp: evaluation.timestamp
  });

  user.totalXP += evaluation.xp;
  
  if (evaluation.score >= 70 && !user.completedChallenges.includes(challengeId)) {
    user.completedChallenges.push(challengeId);
  }

  // Level up calculation
  user.level = Math.floor(user.totalXP / 100) + 1;
}

function getUserProgress(userId) {
  return userProgress[userId] || {
    userId,
    username: 'NewUser',
    level: 1,
    totalXP: 0,
    completedChallenges: [],
    submissions: []
  };
}

function getLeaderboard() {
  return Object.values(userProgress)
    .sort((a, b) => b.totalXP - a.totalXP)
    .slice(0, 10)
    .map((user, index) => ({
      rank: index + 1,
      username: user.username,
      level: user.level,
      totalXP: user.totalXP,
      completedChallenges: user.completedChallenges.length
    }));
}

// Start server
app.listen(PORT, () => {
  console.log(`PromptQuest server running on http://localhost:${PORT}`);
  console.log(`Language: ja (Japanese) or en (English) - use ?lang=en to switch`);
});
