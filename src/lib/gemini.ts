import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyCXaHuCPg9XyPn8ClsJ6IOKOu1Kc1HKzN8');

export interface EntryAnalysis {
  reflection: string;
  keyInsights: string[];
  feelings: string[];
  people: string[];
  mood: 'positive' | 'neutral' | 'negative';
}

export async function analyzeEntryWithGemini(content: string): Promise<EntryAnalysis> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Analyze the following diary entry and provide a comprehensive analysis in JSON format:

Entry: "${content}"

Please provide analysis in this exact JSON structure:
{
  "reflection": "A thoughtful reflection explaining the main themes and meaning of the entry (2-3 sentences)",
  "keyInsights": ["insight1", "insight2", "insight3"],
  "feelings": ["feeling1", "feeling2", "feeling3"],
  "people": ["person1", "person2"] or [] if no people mentioned,
  "mood": "positive|neutral|negative"
}

Guidelines:
- Be empathetic and understanding
- Focus on personal growth and self-awareness
- Identify patterns and deeper meanings
- Provide constructive insights
- Keep insights actionable and positive
- Only include people if explicitly mentioned
- Be accurate with mood assessment

Return only the JSON object, no additional text.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const analysis = JSON.parse(text) as EntryAnalysis;
    
    return analysis;
  } catch (error) {
    console.error('Error analyzing entry with Gemini:', error);
    
    // Fallback analysis if Gemini fails
    return {
      reflection: "This entry shows personal reflection and self-awareness. The content demonstrates thoughtful consideration of experiences and emotions.",
      keyInsights: [
        "Personal reflection and introspection",
        "Emotional awareness and processing",
        "Life experience documentation"
      ],
      feelings: ["reflective", "thoughtful", "contemplative"],
      people: [],
      mood: "neutral"
    };
  }
}

export async function generateEntrySummary(content: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Create a concise, empathetic summary of this diary entry (2-3 sentences):

"${content}"

Focus on:
- Main themes and emotions
- Key experiences or thoughts
- Overall tone and mood

Write in a warm, understanding tone as if you're a supportive friend.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating summary with Gemini:', error);
    return "This entry captures personal thoughts and experiences, showing reflection and self-awareness.";
  }
}
