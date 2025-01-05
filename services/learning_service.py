import logging
import requests
from typing import Dict, Any
import json

logger = logging.getLogger(__name__)

class LearningService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    def generate_lesson_content(self, lesson_name: str, language: str, level: str) -> Dict[str, Any]:
        try:
            prompt = f"""Generate a comprehensive {language} language lesson for {level} level.
            Topic: {lesson_name}

            Provide a detailed response in JSON format with following structure:
            {{
                "title": "{lesson_name}",
                "sections": [
                    {{
                        "title": "Key Vocabulary",
                        "content": [
                            {{"word": "Example", "translation": "Translation", "example": "Example in context", "pronunciation": "Pronunciation guide"}}
                        ]
                    }},
                    {{
                        "title": "Grammar Points",
                        "content": "Detailed grammar explanation with examples"
                    }}
                ],
                "quiz": [
                    {{
                        "question": "Practice question",
                        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                        "answer": "Correct option"
                    }}
                ],
                "summary": "Key points learned"
            }}"""

            response = requests.post(
                self.base_url,
                headers=self.headers,
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7,
                    "max_tokens": 2000,
                    "response_format": { "type": "json_object" }
                },
                timeout=30
            )
            
            response.raise_for_status()
            result = response.json()
            content = result['choices'][0]['message']['content']
            
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                return self._get_fallback_content(lesson_name)

        except Exception as e:
            logger.error(f"Failed to generate lesson content: {str(e)}")
            return self._get_fallback_content(lesson_name)

    def _get_fallback_content(self, lesson_name: str) -> Dict[str, Any]:
        """Return enhanced fallback content with practice dialogues"""
        if lesson_name == "Basic Greetings":
            return {
                "title": "Basic Greetings",
                "sections": [
                    {
                        "title": "Key Vocabulary",
                        "content": [
                            {
                                "word": "¡Hola!",
                                "translation": "Hello!",
                                "example": "¡Hola! ¿Cómo estás?",
                                "pronunciation": "o-la"
                            },
                            {
                                "word": "Buenos días",
                                "translation": "Good morning",
                                "example": "Buenos días, ¿qué tal?",
                                "pronunciation": "bwe-nos dee-as"
                            }
                        ]
                    },
                    {
                        "title": "Common Expressions",
                        "content": [
                            {
                                "expression": "¿Qué tal?",
                                "meaning": "How's it going?",
                                "usage": "Informal greeting used throughout the day",
                                "example": "¡Hola! ¿Qué tal? - ¡Todo bien!"
                            },
                            {
                                "expression": "Mucho gusto",
                                "meaning": "Nice to meet you",
                                "usage": "Used when meeting someone for the first time",
                                "example": "Mucho gusto, me llamo Juan."
                            }
                        ]
                    }
                ],
                # ...rest of the content structure...
            }
        # ...rest of the function...
