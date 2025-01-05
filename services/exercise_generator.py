import logging
from typing import List, Dict, Any
import requests

logger = logging.getLogger(__name__)

class ExerciseGenerator:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    def generate_exercises(self, exercise_type: str, level: str, language: str) -> List[Dict[str, Any]]:
        prompt = f"""Generate meaningful language learning exercises for {language} at {level} level.
        Exercise type: {exercise_type}
        
        Requirements:
        1. Sentences should be practical and commonly used in real conversations
        2. Include proper grammar explanations
        3. Ensure cultural context where appropriate
        4. Provide clear instructions
        5. Include varied difficulty within the level

        Format the response as a JSON array of exercises with this structure:
        {{
            "type": "{exercise_type}",
            "question": "Clear instruction",
            "options": ["word1", "word2", ...],
            "correct_answer": "Correct answer",
            "explanation": "Grammar/usage explanation",
            "difficulty": "{level}",
            "points": 10
        }}

        Generate 3-5 exercises."""

        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7,
                    "max_tokens": 2000,
                    "response_format": { "type": "json_object" }
                }
            )
            
            response.raise_for_status()
            result = response.json()
            exercises = result['choices'][0]['message']['content']
            
            return exercises

        except Exception as e:
            logger.error(f"Failed to generate exercises: {str(e)}")
            return self._get_fallback_exercises(exercise_type, level, language)

    def _get_fallback_exercises(self, exercise_type: str, level: str, language: str) -> List[Dict[str, Any]]:
        # Implement fallback exercises for each language and type
        fallback_exercises = {
            "English": {
                "sentence-builder": [
                    {
                        "type": "sentence-builder",
                        "question": "Arrange the words to form a complete sentence",
                        "options": ["I", "would", "like", "to", "learn", "more"],
                        "correct_answer": "I would like to learn more",
                        "explanation": "This is a polite way to express desire using 'would like to'",
                        "difficulty": level,
                        "points": 10
                    }
                ]
            }
        }
        
        return fallback_exercises.get(language, {}).get(exercise_type, [])
