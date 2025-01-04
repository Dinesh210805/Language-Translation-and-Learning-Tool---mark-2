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
                "introduction": "Brief introduction to the topic",
                "sections": [
                    {{
                        "title": "Key Vocabulary",
                        "content": [
                            {{"word": "Hola", "translation": "Hello", "example": "Hola, ¿cómo estás?"}},
                            {{"word": "Buenos días", "translation": "Good morning", "example": "Buenos días, ¿qué tal tu fin de semana?"}}
                        ]
                    }},
                    {{
                        "title": "Grammar Points",
                        "content": "Explanation of relevant grammar rules"
                    }},
                    {{
                        "title": "Practice Dialogues",
                        "content": "Example conversations using the learned material"
                    }}
                ],
                "quiz": [
                    {{
                        "question": "Practice question about the material",
                        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                        "answer": "Correct option"
                    }}
                ],
                "summary": "Key takeaways from the lesson"
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
        """Return fallback content if generation fails"""
        return {
            "title": lesson_name,
            "introduction": "Welcome to this lesson!",
            "sections": [
                {
                    "title": "Getting Started",
                    "content": "We're preparing the best content for you. Please try again in a moment."
                }
            ],
            "summary": "More content coming soon!"
        }
