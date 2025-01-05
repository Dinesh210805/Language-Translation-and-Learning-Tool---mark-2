import requests
import logging
import re
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class ChatbotService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    def format_response(self, content: str) -> str:
        formatted = content.strip()
        
        # Add clear section breaks
        section_formats = {
            'Example': (
                '## 🔍 Examples\n'
                '{content}\n'
            ),
            'Practice': (
                '## ✨ Practice This\n'
                '{content}\n'
            ),
            'Grammar': (
                '## 📚 Grammar Note\n'
                '{content}\n'
            ),
            'Vocabulary': (
                '## 📖 Vocabulary\n'
                '{content}\n'
            ),
            'Tip': (
                '## 💡 Pro Tip\n'
                '{content}\n'
            ),
            'Translation': (
                '## 🗣️ Translation\n'
                '{content}\n'
            )
        }
        
        # Format sections
        for section, template in section_formats.items():
            pattern = f'{section}:(.*?)(?=(?:{"|".join(section_formats.keys())}):|\Z)'
            matches = re.finditer(pattern, formatted, re.DOTALL)
            for match in matches:
                content = match.group(1).strip()
                formatted = formatted.replace(
                    f'{section}:{content}',
                    template.format(content=content)
                )
        
        # Format translations
        formatted = re.sub(
            r'([^(]+)\s*\(([^)]+)\)',
            r'\1\n(\2)',
            formatted
        )
        
        # Format lists
        formatted = re.sub(r'(?m)^[-•]\s*(.+)$', r'* \1', formatted)
        
        return formatted

    def generate_response(self, messages: List[Dict[str, str]], language: str = "en") -> Dict[str, Any]:
        try:
            # Clean up messages format
            formatted_messages = [
                {"role": "system", "content": self._get_system_prompt(language)}
            ]

            # Add conversation history
            for msg in messages:
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                if content:  # Only add non-empty messages
                    formatted_messages.append({
                        "role": role,
                        "content": content
                    })

            response = requests.post(
                self.base_url,
                headers=self.headers,
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": formatted_messages,
                    "temperature": 0.7,
                    "max_tokens": 500,
                }
            )
            
            response.raise_for_status()
            result = response.json()

            if not result.get('choices'):
                raise ValueError("No response generated")

            content = result['choices'][0]['message']['content']
            formatted_content = self.format_response(content)
            
            # Generate suggested next options based on the conversation
            suggested_options = self._generate_options(formatted_content, language)

            return {
                "response": formatted_content,
                "options": suggested_options
            }

        except Exception as e:
            logger.error(f"Chatbot response generation error: {str(e)}")
            raise

    def _get_system_prompt(self, language: str) -> str:
        return f"""You are a language tutor. Always respond in {language}.
        Keep responses clear and structured.
        Use markdown formatting for better readability.
        Current language: {language}
        
        Example format:
        ## 📚 Topic
        Main content here
        
        ## ✨ Example
        - Point 1
        - Point 2
        
        ## 💡 Practice
        Try these exercises..."""

    def _generate_options(self, last_response: str, language: str) -> List[str]:
        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {
                            "role": "system",
                            "content": "Generate 3 relevant follow-up options based on the previous response."
                        },
                        {
                            "role": "user",
                            "content": f"Previous response: {last_response}\nGenerate 3 natural follow-up options for continuing the conversation about learning {language}."
                        }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 150
                }
            )
            
            response.raise_for_status()
            result = response.json()
            
            if not result.get('choices'):
                return ["Tell me more", "Give me an example", "Let's practice"]

            options_text = result['choices'][0]['message']['content']
            options = [opt.strip('- ').strip() for opt in options_text.split('\n') if opt.strip()][:3]
            return options if options else ["Tell me more", "Give me an example", "Let's practice"]

        except Exception as e:
            logger.error(f"Options generation error: {str(e)}")
            return ["Tell me more", "Give me an example", "Let's practice"]
