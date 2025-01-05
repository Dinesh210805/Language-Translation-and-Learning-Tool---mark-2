import logging
import requests
from typing import Dict, Any
import json

logger = logging.getLogger(__name__)

class PracticeService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    def generate_exercises(self, language: str, level: str, exercise_type: str) -> Dict[str, Any]:
        try:
            prompt = self._get_exercise_prompt(language, level, exercise_type)
            
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are an expert language teacher creating interactive exercises."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 2000,
                    "response_format": { "type": "json_object" }
                }
            )
            
            if not response.ok:
                logger.error(f"API call failed: {response.text}")
                return self._get_fallback_exercises(language, exercise_type)

            result = response.json()
            content = result['choices'][0]['message']['content']
            parsed_content = json.loads(content)

            # Transform API response to match expected format
            exercises_data = self.transform_response(parsed_content, exercise_type)

            if not exercises_data["exercises"]:
                return self._get_fallback_exercises(language, exercise_type)

            return exercises_data

        except Exception as e:
            logger.error(f"Failed to generate exercises: {str(e)}")
            return self._get_fallback_exercises(language, exercise_type)

    def _get_exercise_prompt(self, language: str, level: str, exercise_type: str) -> str:
        exercise_prompts = {
            "vocabulary-match": f"""Create a vocabulary matching game in {language} with:
                - Word pairs to match
                - Visual descriptions
                - Usage contexts
                - Progressive difficulty
                - Fun cultural elements""",
            
            "sentence-builder": f"""Create a sentence building exercise in {language} with:
                - Word blocks to arrange
                - Multiple correct possibilities
                - Context-based scenarios
                - Grammar tips
                - Difficulty progression""",
            
            "listening-challenge": f"""Design a listening comprehension game in {language} with:
                - Short audio transcripts
                - Multiple choice questions
                - Fill-in-missing-words
                - Speed challenges
                - Accent variations""",
            
            "pronunciation-game": f"""Create a pronunciation practice game in {language} with:
                - Tongue twisters
                - Rhythm patterns
                - Sound pairs
                - Recording challenges
                - Scoring system""",
            
            "word-puzzle": f"""Design a word puzzle in {language} with:
                - Crossword elements
                - Word search components
                - Hangman variations
                - Category sorting
                - Time challenges""",
            
            "conversation-sim": f"""Create a conversation simulation in {language} with:
                - Real-life scenarios
                - Multiple response paths
                - Cultural context
                - Formal/informal variations
                - Role-playing elements""",
            
            "memory-cards": f"""Design a memory card game in {language} with:
                - Word-picture pairs
                - Phrase matching
                - Category grouping
                - Progressive levels
                - Time bonuses""",
            
            "fill-blanks": f"""Create fill-in-the-blanks exercises in {language} with:
                - Context-rich sentences
                - Multiple word choices
                - Grammar patterns
                - Difficulty progression
                - Story completion"""
        }

        return f"""Generate an engaging {exercise_type} exercise for {language} learners at {level} level.
        {exercise_prompts.get(exercise_type, "")}
        
        Return a JSON object with:
        {{
            "type": "{exercise_type}",
            "setup": {{
                "instructions": "Clear game instructions",
                "time_limit": optional_seconds,
                "points_possible": total_points,
                "bonus_conditions": ["condition1", "condition2"]
            }},
            "content": {{
                "rounds": [
                    {{
                        "items": ["item1", "item2"],
                        "correct_matches": {{"item1": "match1"}},
                        "hints": ["hint1", "hint2"],
                        "points": points_per_correct,
                        "time_bonus": seconds_for_bonus,
                        "context": "usage context",
                        "difficulty": "progressive difficulty"
                    }}
                ],
                "bonus_content": {{
                    "cultural_notes": ["note1", "note2"],
                    "fun_facts": ["fact1", "fact2"],
                    "achievement_badges": ["badge1", "badge2"]
                }}
            }},
            "feedback": {{
                "correct_responses": ["Great job!", "Excellent!"],
                "incorrect_responses": ["Try again!", "Almost there!"],
                "hint_messages": ["Think about...", "Remember..."],
                "completion_message": "Congratulation message"
            }}
        }}"""

    def _get_fallback_exercises(self, language: str, exercise_type: str) -> Dict[str, Any]:
        """Return structured fallback content"""
        language_content = {
            "Spanish": {
                "vocabulary-match": {
                    "exercises": [
                        {
                            "type": "vocabulary-match",
                            "question": "Match the words with their meanings",
                            "options": [
                                "la familia", "la escuela", "el trabajo", "el restaurante",
                                "family", "school", "work", "restaurant"
                            ],
                            "pairs": {
                                "la familia": "family",
                                "la escuela": "school",
                                "el trabajo": "work",
                                "el restaurante": "restaurant"
                            },
                            "correct_answer": "la familia - family",
                            "explanation": "Match each Spanish word with its English translation",
                            "difficulty": "A1",
                            "points": 10,
                            "hints": ["Remember that 'el' and 'la' are articles"]
                        }
                    ],
                    "vocabulary": [
                        {"word": "la familia", "translation": "family", "usage": "Mi familia es grande"},
                        {"word": "la escuela", "translation": "school", "usage": "Voy a la escuela"},
                        {"word": "el trabajo", "translation": "work", "usage": "El trabajo es importante"},
                        {"word": "el restaurante", "translation": "restaurant", "usage": "Cenamos en el restaurante"}
                    ]
                }
            },
            "French": {
                "vocabulary-match": {
                    "exercises": [
                        {
                            "type": "vocabulary-match",
                            "question": "Match the words with their meanings",
                            "options": [
                                "la famille", "l'école", "le travail", "le restaurant",
                                "family", "school", "work", "restaurant"
                            ],
                            "pairs": {
                                "la famille": "family",
                                "l'école": "school",
                                "le travail": "work",
                                "le restaurant": "restaurant"
                            },
                            "correct_answer": "la famille - family",
                            "explanation": "Match each French word with its English translation",
                            "difficulty": "A1",
                            "points": 10
                        }
                    ],
                    "vocabulary": [
                        {"word": "la famille", "translation": "family", "usage": "Ma famille est grande"},
                        {"word": "l'école", "translation": "school", "usage": "Je vais à l'école"},
                        {"word": "le travail", "translation": "work", "usage": "Le travail est important"},
                        {"word": "le restaurant", "translation": "restaurant", "usage": "On dîne au restaurant"}
                    ]
                }
            },
            "English": {
                "vocabulary-match": {
                    "exercises": [
                        {
                            "type": "vocabulary-match",
                            "question": "Match the words with their meanings",
                            "options": [
                                "family", "school", "work", "restaurant",
                                "la familia", "la escuela", "el trabajo", "el restaurante"
                            ],
                            "pairs": {
                                "family": "la familia",
                                "school": "la escuela",
                                "work": "el trabajo",
                                "restaurant": "el restaurante"
                            },
                            "correct_answer": "family - la familia",
                            "explanation": "Match each English word with its Spanish translation",
                            "difficulty": "A1",
                            "points": 10,
                            "hints": ["Remember the context of each word"]
                        }
                    ],
                    "vocabulary": [
                        {"word": "family", "translation": "la familia", "usage": "My family is big"},
                        {"word": "school", "translation": "la escuela", "usage": "I go to school"},
                        {"word": "work", "translation": "el trabajo", "usage": "Work is important"},
                        {"word": "restaurant", "translation": "el restaurante", "usage": "We dine at the restaurant"}
                    ]
                }
            }
        }

        # Get language-specific content or use default
        lang_content = language_content.get(language, {})
        exercise_content = lang_content.get(exercise_type, {})

        if not exercise_content:
            # Provide basic fallback if no specific content exists
            return {
                "exercises": [
                    {
                        "type": exercise_type,
                        "question": f"Practice {language} {exercise_type}",
                        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                        "correct_answer": "Option 1",
                        "explanation": f"Basic {language} exercise",
                        "difficulty": "A1",
                        "points": 10
                    }
                ],
                "vocabulary": [
                    {"word": "Example", "translation": "Translation", "usage": "Usage example"}
                ]
            }

        return exercise_content

    def transform_response(self, data: Dict[str, Any], exercise_type: str) -> Dict[str, Any]:
        """Transform API response to match the expected format"""
        if "content" not in data or "rounds" not in data["content"]:
            return self._get_fallback_exercises("Spanish", exercise_type)  # Default to Spanish if language unknown

        try:
            rounds = data["content"]["rounds"]
            exercises = []
            
            for round_data in rounds:
                exercise = {
                    "type": exercise_type,
                    "question": round_data.get("context", "Match the following"),
                    "options": round_data.get("items", []),
                    "correct_answer": list(round_data.get("correct_matches", {}).values())[0],
                    "explanation": round_data.get("explanation", ""),
                    "difficulty": round_data.get("difficulty", "A1"),
                    "points": round_data.get("points", 10),
                    "pairs": round_data.get("correct_matches", {})
                }
                exercises.append(exercise)

            return {
                "exercises": exercises,
                "vocabulary": [
                    {
                        "word": item,
                        "translation": round_data["correct_matches"].get(item, ""),
                        "usage": round_data.get("context", "")
                    }
                    for round_data in rounds
                    for item in round_data.get("items", [])
                ]
            }
        except Exception as e:
            logger.error(f"Error transforming response: {e}")
            return self._get_fallback_exercises("Spanish", exercise_type)
