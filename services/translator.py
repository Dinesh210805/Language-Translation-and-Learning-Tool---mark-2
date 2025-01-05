import json
import requests
import logging
import time
import base64
from typing import Dict
from langdetect import detect, LangDetectException
from .speech_service import SpeechService

logger = logging.getLogger(__name__)

LANGUAGES = {
    "English": "en",
    "Spanish": "es",
    "French": "fr",
    "German": "de",
    "Italian": "it",
    "Portuguese": "pt",
    "Chinese (Simplified)": "zh",
    "Chinese (Traditional)": "zh-TW",
    "Japanese": "ja",
    "Korean": "ko",
    "Russian": "ru",
    "Arabic": "ar",
    "Hindi": "hi",
    "Bengali": "bn",
    "Turkish": "tr",
    "Vietnamese": "vi",
    "Thai": "th",
    "Dutch": "nl",
    "Greek": "el",
    "Polish": "pl",
    "Tamil": "ta",
    "Telugu": "te",
    "Gujarati": "gu",
    "Kannada": "kn",
    "Malayalam": "ml",
    "Marathi": "mr",
    "Punjabi": "pa",
    "Urdu": "ur",
    "Indonesian": "id",
    "Malay": "ms",
    "Filipino": "fil",
    "Swedish": "sv",
    "Danish": "da",
    "Norwegian": "no",
    "Finnish": "fi",
    "Czech": "cs",
    "Romanian": "ro",
    "Hungarian": "hu",
    "Ukrainian": "uk",
    "Hebrew": "he"
}

class GroqTranslator:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        self.languages = LANGUAGES
        self.retry_delay = 1  # Initial delay in seconds
        self.max_retries = 3
        self.last_request_time = 0
        self.min_request_interval = 1  # Minimum time between requests in seconds

    def _handle_rate_limit(self, retry_count: int) -> None:
        """Handle rate limiting with exponential backoff."""
        if retry_count >= self.max_retries:
            raise Exception("Max retries exceeded, please try again later")
        
        delay = self.retry_delay * (2 ** retry_count)
        logger.warning(f"Rate limited, waiting {delay} seconds before retry")
        time.sleep(delay)

    def _respect_rate_limit(self) -> None:
        """Ensure minimum time between requests."""
        current_time = time.time()
        time_since_last_request = current_time - self.last_request_time
        if time_since_last_request < self.min_request_interval:
            time.sleep(self.min_request_interval - time_since_last_request)
        self.last_request_time = time.time()
        
    def detect_language(self, text: str) -> str:
        """Detect the language of the input text."""
        try:
            detected = detect(text)
            # Map detected language code to our supported languages
            for lang_code in self.languages.values():
                if detected.startswith(lang_code):
                    return lang_code
            return "en"  # fallback to English if not found
        except LangDetectException:
            logger.warning("Could not detect language, falling back to English")
            return "en"

    def translate_with_context(self, text: str, source_lang: str, target_lang: str) -> Dict:
        retry_count = 0
        while retry_count < self.max_retries:
            try:
                self._respect_rate_limit()

                if source_lang == "auto":
                    source_lang = self.detect_language(text)
                    logger.info(f"Detected language: {source_lang}")

                prompt = f"""You are an expert language tutor providing comprehensive translation assistance.
                Please translate the following text and provide detailed learning context.
                
                Text to translate: "{text}"
                From: {source_lang}
                To: {target_lang}

                Respond with valid JSON only, using this exact format:
                {{
                    "translation": "<direct translation>",
                    "literal": "<detailed word-by-word translation with part of speech for each word>",
                    "cultural_context": {{
                        "usage": "<explain when and how this phrase is commonly used>",
                        "formality": "<explain the formality level and appropriate situations>",
                        "cultural_notes": "<any cultural significance or nuances>",
                        "regional_variations": "<different ways this might be expressed in different regions>"
                    }},
                    "grammar": {{
                        "explanation": "<detailed grammar explanation>",
                        "key_points": ["<key grammar point 1>", "<key grammar point 2>"],
                        "tense_mood": "<explain tense and mood used>",
                        "structure": "<break down the sentence structure>",
                        "common_mistakes": ["<common mistake 1>", "<common mistake 2>"]
                    }},
                    "examples": [
                        {{
                            "original": "<example in target language>",
                            "translation": "<translation in source language>",
                            "context": "<when to use this example>",
                            "level": "<difficulty level>"
                        }},
                        // more examples...
                    ],
                    "idioms": [
                        {{
                            "phrase": "<related idiom/expression>",
                            "meaning": "<literal meaning>",
                            "usage": "<how and when to use it>",
                            "equivalent": "<equivalent in source language if any>"
                        }},
                        // more idioms...
                    ],
                    "practice_tips": [
                        "<specific practice suggestion 1>",
                        "<specific practice suggestion 2>"
                    ],
                    "pronunciation": {{
                        "ipa": "<IPA transcription>",
                        "tips": ["<pronunciation tip 1>", "<pronunciation tip 2>"],
                        "common_challenges": "<common pronunciation challenges>"
                    }},
                    "vocabulary": [
                        {{
                            "word": "<key word from text>",
                            "type": "<part of speech>",
                            "meaning": "<definition>",
                            "synonyms": ["<synonym 1>", "<synonym 2>"],
                            "usage_example": "<example sentence>"
                        }},
                        // more vocabulary items...
                    ],
                    "learning_level": "<difficulty level of this content>",
                    "related_topics": ["<related grammar topic 1>", "<related grammar topic 2>"]
                }}"""

                response = requests.post(
                    self.base_url,
                    headers=self.headers,
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.3,
                        "max_tokens": 2000,
                        "response_format": { "type": "json_object" }
                    },
                    timeout=30
                )
                
                if response.status_code == 429:  # Too Many Requests
                    self._handle_rate_limit(retry_count)
                    retry_count += 1
                    continue
                
                response.raise_for_status()
                result = response.json()
                
                if 'choices' not in result or not result['choices']:
                    raise Exception("Invalid API response format")
                    
                content = result['choices'][0]['message']['content']
                logger.debug(f"Raw API response content: {content}")
                
                # Clean up the content string if needed
                content = content.strip()
                if not content.startswith('{'):
                    content = content[content.find('{'):]
                if not content.endswith('}'):
                    content = content[:content.rfind('}')+1]
                
                try:
                    translation_data = json.loads(content)
                except json.JSONDecodeError as e:
                    logger.error(f"JSON Parse Error: {str(e)}, Content: {content}")
                    # Provide a fallback response if parsing fails
                    return {
                        "translation": text,  # Return original text as fallback
                        "literal": "Translation parsing failed",
                        "cultural_context": "Not available",
                        "grammar": "Not available",
                        "examples": [],
                        "idioms": [],
                        "conversation": "I apologize, but I couldn't process the translation properly."
                    }
                
                # Validate required fields
                required_fields = ["translation", "literal", "cultural_context", "grammar", "examples", "idioms", "conversation"]
                for field in required_fields:
                    if field not in translation_data:
                        translation_data[field] = "Not provided" if field not in ["examples", "idioms"] else []

                # Add default values for new fields if missing
                additional_fields = [
                    "practice_tips", "pronunciation", "vocabulary",
                    "learning_level", "related_topics"
                ]
                
                for field in additional_fields:
                    if field not in translation_data:
                        if field in ["practice_tips", "related_topics"]:
                            translation_data[field] = []
                        elif field == "pronunciation":
                            translation_data[field] = {
                                "ipa": "Not provided",
                                "tips": [],
                                "common_challenges": "Not provided"
                            }
                        elif field == "vocabulary":
                            translation_data[field] = []
                        else:
                            translation_data[field] = "Not provided"

                return translation_data

            except requests.exceptions.RequestException as e:
                if hasattr(e.response, 'status_code') and e.response.status_code == 429:
                    self._handle_rate_limit(retry_count)
                    retry_count += 1
                    continue
                logger.error(f"API request failed: {str(e)}")
                raise Exception(f"Translation service error: {str(e)}")
            except Exception as e:
                logger.error(f"Unexpected error: {str(e)}")
                raise

        raise Exception("Translation failed after maximum retries")

    def translate_voice(self, audio_data: bytes, source_lang: str, target_lang: str) -> Dict:
        """Translate voice input to voice output with proper error handling."""
        try:
            speech_service = SpeechService(self.api_key)
            
            # First transcribe the audio
            transcription = speech_service.transcribe_audio(audio_data, source_lang)
            if not transcription or 'text' not in transcription:
                raise ValueError("Failed to transcribe audio")

            # Then translate the text
            translation = self.translate_with_context(
                transcription['text'],
                source_lang,
                target_lang
            )

            # Ensure valid base64 encoding for audio response
            try:
                import base64
                audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            except Exception as e:
                logger.error(f"Audio encoding error: {str(e)}")
                audio_base64 = ""

            return {
                'translation': translation['translation'],
                'translationDetails': translation,
                'audio': audio_base64,
                'original_text': transcription['text']
            }

        except Exception as e:
            logger.error(f"Voice translation error: {str(e)}")
            raise