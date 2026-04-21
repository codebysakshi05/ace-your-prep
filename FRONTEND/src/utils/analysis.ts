export type AnalysisResult = {
  grammarScore: number;
  clarityScore: number;
  overallScore: number;
  suggestions: string[];
};

export function analyzeResponse(text: string, contextKeywords: string[] = []): AnalysisResult {
  if (!text || text.trim().length === 0) {
    return {
      grammarScore: 0,
      clarityScore: 0,
      overallScore: 0,
      suggestions: ["Please provide a response to receive feedback."]
    };
  }

  const result: AnalysisResult = {
    grammarScore: 85,
    clarityScore: 80,
    overallScore: 0,
    suggestions: []
  };

  const lowerText = text.toLowerCase();
  let words = text.split(/\s+/).filter(w => w.length > 0);

  // Grammar heuristics
  if (!/^[A-Z]/.test(text)) {
    result.grammarScore -= 15;
    result.suggestions.push("Ensure you start your sentences with a capital letter.");
  }
  
  if (!/[.!?]$/.test(text.trim())) {
    result.grammarScore -= 10;
    result.suggestions.push("End your response with proper punctuation.");
  }

  if (words.length < 15) {
    result.clarityScore -= 30;
    result.suggestions.push("Your response is too brief. Elaborate further to make your point clearer.");
  } else if (words.length > 100) {
    result.clarityScore += 10;
  }

  // Keyword heuristics
  let keywordHits = 0;
  for (const kw of contextKeywords) {
    if (lowerText.includes(kw.toLowerCase())) {
      keywordHits++;
    }
  }

  if (contextKeywords.length > 0) {
    if (keywordHits === 0) {
      result.clarityScore -= 20;
      result.suggestions.push(`Try to weave in relevant keywords like: ${contextKeywords.slice(0, 2).join(', ')}.`);
    } else {
      result.clarityScore += (keywordHits * 5);
      result.suggestions.push("Great job utilizing relevant professional terminology.");
    }
  }

  // Common weak phrases
  const weakPhrases = ["i think", "maybe", "like", "um", "kind of"];
  let weakHit = false;
  for (const phrase of weakPhrases) {
    if (lowerText.includes(phrase)) {
      weakHit = true;
      result.clarityScore -= 5;
    }
  }
  if (weakHit) {
    result.suggestions.push("Avoid weak or filler phrases (e.g. 'I think', 'maybe'). Speak with authority.");
  }

  // Cap scores and calculate overall
  result.grammarScore = Math.min(100, Math.max(0, result.grammarScore));
  result.clarityScore = Math.min(100, Math.max(0, result.clarityScore));
  result.overallScore = Math.round((result.grammarScore + result.clarityScore) / 2);

  return result;
}
