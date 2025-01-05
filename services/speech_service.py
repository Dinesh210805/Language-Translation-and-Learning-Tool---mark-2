import requests
import base64
import logging
from typing import Dict

logger = logging.getLogger(__name__)

class SpeechService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.groq.com/openai/v1/audio"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "multipart/form-data"  # Changed for file upload
        }

    def transcribe_audio(self, audio_data: bytes, source_lang: str = "auto") -> Dict:
        """Transcribe audio using Whisper model."""
        try:
            # Prepare the files and data
            files = {
                'file': ('audio.wav', audio_data, 'audio/wav')
            }
            data = {
                'model': 'whisper-large-v3',  # Using Whisper Large v3 model
                'language': source_lang if source_lang != "auto" else None,
                'response_format': 'json'
            }
            
            # Send request to the correct endpoint
            response = requests.post(
                f"{self.base_url}/transcriptions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                files=files,
                data=data
            )
            response.raise_for_status()
            return response.json()

        except Exception as e:
            logger.error(f"Transcription error: {str(e)}")
            raise

    def translate_audio(self, audio_data: bytes) -> Dict:
        """Translate audio directly to English text using Whisper."""
        try:
            # Prepare the files and data
            files = {
                'file': ('audio.wav', audio_data, 'audio/wav')
            }
            data = {
                'model': 'whisper-large-v3',  # Using Whisper Large v3 model
                'response_format': 'json'
            }
            
            # Use the translations endpoint for direct audio translation
            response = requests.post(
                f"{self.base_url}/translations",
                headers={"Authorization": f"Bearer {self.api_key}"},
                files=files,
                data=data
            )
            response.raise_for_status()
            return response.json()

        except Exception as e:
            logger.error(f"Audio translation error: {str(e)}")
            raise

    def synthesize_speech(self, text: str, lang: str) -> bytes:
        """Convert text to speech using TTS."""
        raise NotImplementedError("Speech synthesis is not supported by Groq API")
