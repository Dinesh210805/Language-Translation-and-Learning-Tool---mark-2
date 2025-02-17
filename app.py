from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from services.translator import GroqTranslator
import os
import logging
import requests
import json
from werkzeug.utils import secure_filename
import tempfile
from services.learning_service import LearningService
from youtube_transcript_api import YouTubeTranscriptApi
from services.practice_service import PracticeService
from services.chatbot_service import ChatbotService

app = Flask(__name__)
# Update CORS configuration to be more permissive for development
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "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")
GROQ_API_ENDPOINT = "https://api.groq.com/v1/completions"
translator = GroqTranslator(GROQ_API_KEY)
learning_service = LearningService(GROQ_API_KEY)
practice_service = PracticeService(GROQ_API_KEY)
chatbot_service = ChatbotService(GROQ_API_KEY)

CHATBOT_RESPONSES = {
    'Basic Phrases': {
        'es': {
            'Greetings': {
                'response': "Let's learn some Spanish greetings:\n• Hola = Hello\n• Buenos días = Good morning\n• Buenas tardes = Good afternoon\n• Buenas noches = Good night\n• ¿Cómo estás? = How are you?",
                'options': ["Practice greetings", "Learn more phrases", "Test my knowledge"]
            },
            # Add more Spanish-specific responses
        },
        'fr': {
            'Greetings': {
                'response': "Let's learn some French greetings:\n• Bonjour = Hello\n• Salut = Hi\n• Bonne journée = Good day\n• Bonsoir = Good evening\n• Comment allez-vous? = How are you?",
                'options': ["Practice greetings", "Learn more phrases", "Test my knowledge"]
            },
            # Add more French-specific responses
        }
    },
    'Grammar': {
        'es': {
            'Present Tense': {
                'response': "The Spanish present tense is used to talk about habits and current actions. Let's start with regular -ar verbs:\n• hablar (to speak)\n• yo hablo = I speak\n• tú hablas = you speak\n• él/ella habla = he/she speaks",
                'options': ["Practice conjugation", "More examples", "Try exercises"]
            }
        }
    },
    'Detailed Grammar': {
        'en': {
            'Sentence Structure': {
                'response': (
                    "Let's dive into English sentence structure. A basic English sentence follows the Subject-Verb-Object order. "
                    "For example: 'I (subject) play (verb) soccer (object).'\n\n"
                    "You can also include adverbs or adjectives to add more detail. Try forming a few sentences using this pattern!"
                ),
                'options': ["Practice sentence structure", "More examples", "Try exercises"]
            },
            'Verb Conjugation': {
                'response': (
                    "English verbs change form based on tense and grammar constructions. Examples:\n"
                    "• Present Simple: I walk\n"
                    "• Past Simple: I walked\n"
                    "• Present Continuous: I am walking\n\n"
                    "We can work on detailed conjugation drills if you'd like."
                ),
                'options': ["Conjugation drills", "Additional tenses", "Try exercises"]
            },
            'Complex Sentences': {
                'response': (
                    "Complex sentences contain an independent clause and one or more dependent clauses. "
                    "For example: 'I went to the store (independent) because I needed milk (dependent).'\n\n"
                    "Learning to link clauses effectively will help you sound more fluent!"
                ),
                'options': ["Practice linking clauses", "Common connectors", "Try exercises"]
            }
        }
    }
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/translate/text', methods=['POST'])
def translate_text():
    try:
        data = request.get_json()
        logger.debug(f"Received translation request: {data}")

        if not data:
            return jsonify({'error': 'No JSON data received'}), 400

        text = data.get('text')
        source_lang = data.get('sourceLang')
        target_lang = data.get('targetLang')

        if not all([text, source_lang, target_lang]):
            return jsonify({
                'error': 'Missing required parameters',
                'received': {
                    'text': text,
                    'sourceLang': source_lang,
                    'targetLang': target_lang
                }
            }), 400

        result = translator.translate_with_context(text, source_lang, target_lang)
        logger.debug(f"Translation result: {result}")
        
        return jsonify(result)

    except Exception as e:
        logger.exception("Translation error occurred")
        return jsonify({'error': str(e)}), 500

@app.route('/api/translate/voice', methods=['POST'])
def translate_voice():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400

        audio_file = request.files['audio']
        source_lang = request.form.get('sourceLang', 'auto')
        target_lang = request.form.get('targetLang')

        if not target_lang:
            return jsonify({'error': 'Target language is required'}), 400

        # Create a temporary directory if it doesn't exist
        temp_dir = os.path.join(os.path.dirname(__file__), 'temp')
        os.makedirs(temp_dir, exist_ok=True)

        # Save the audio file temporarily
        temp_path = os.path.join(temp_dir, secure_filename(audio_file.filename))
        audio_file.save(temp_path)

        try:
            with open(temp_path, 'rb') as f:
                audio_data = f.read()
            
            # Process the translation
            result = translator.translate_voice(audio_data, source_lang, target_lang)
            return jsonify(result)
        finally:
            # Clean up the temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e:
        logger.exception("Voice translation error occurred")
        return jsonify({'error': str(e)}), 500

@app.route('/api/translate/examples', methods=['POST'])
def generate_examples():
    try:
        data = request.get_json()
        text = data.get('text')
        source_lang = data.get('sourceLang')
        target_lang = data.get('targetLang')
        
        # Generate additional examples using the translator
        result = translator.generate_additional_examples(text, source_lang, target_lang)
        return jsonify(result)
    except Exception as e:
        logger.exception("Failed to generate examples")
        return jsonify({'error': str(e)}), 500

@app.route('/api/learning/lesson', methods=['POST'])
def get_lesson():
    try:
        data = request.get_json()
        if not data:
            raise ValueError("No data provided")

        lesson_name = data.get('lesson')
        language = data.get('language')
        level = data.get('level')

        if not all([lesson_name, language, level]):
            raise ValueError("Missing required parameters")

        content = learning_service.generate_lesson_content(lesson_name, language, level)
        
        if not content or not content.get('sections'):
            raise ValueError("Invalid lesson content generated")

        return jsonify(content)

    except Exception as e:
        logger.exception("Failed to generate lesson")
        return jsonify({'error': str(e)}), 500

@app.route('/api/lessons', methods=['GET'])
def get_lessons():
    # TODO: Implement lessons retrieval
    pass

@app.route('/api/practice', methods=['GET'])
def get_practice():
    # TODO: Implement practice exercises
    pass

@app.route('/api/chatbot', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        messages = data.get('messages', [])
        language = data.get('language', 'en')
        
        # Validate language parameter
        if language not in ['en', 'es', 'fr', 'de']:
            language = 'en'
            
        logger.debug(f"Chat request - Language: {language}, Messages: {messages}")

        # Ensure messages are properly formatted
        formatted_messages = []
        for msg in messages:
            if isinstance(msg, dict) and 'content' in msg and 'role' in msg:
                formatted_messages.append(msg)

        if not formatted_messages:
            return jsonify({'error': 'Invalid message format'}), 400

        result = chatbot_service.generate_response(formatted_messages, language)
        
        return jsonify({
            'response': result['response'],
            'options': result['options'],
            'language': language
        })

    except Exception as e:
        logger.exception("Chatbot error occurred")
        error_msg = str(e)
        return jsonify({
            'error': f'Chatbot error: {error_msg}',
            'details': 'Please try again'
        }), 500

@app.route('/api/achievements', methods=['GET'])
def get_achievements():
    # TODO: Implement achievements
    pass

@app.route('/api/history', methods=['GET'])
def get_history():
    # TODO: Implement history retrieval
    pass

@app.route('/api/youtube/captions', methods=['GET'])
def get_youtube_captions():
    video_id = request.args.get('videoId')
    target_language = request.args.get('language', '').lower()
    
    if not video_id or not target_language:
        return jsonify({'error': 'Missing required parameters'}), 400

    try:
        # Get transcript list
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        
        # Language code mapping
        lang_map = {
            'spanish': ['es', 'es-419', 'es-ES', 'es-MX', 'es-US'],
            'french': ['fr', 'fr-FR', 'fr-CA'],
            'german': ['de', 'de-DE']
        }

        target_codes = lang_map.get(target_language, [target_language])
        
        # Try to get transcript in target language
        transcript = None
        orig_language = None

        # First try regular transcripts
        for lang_code in target_codes:
            try:
                transcript = transcript_list.find_transcript([lang_code])
                orig_language = lang_code
                logger.info(f"Found transcript in {lang_code}")
                break
            except:
                continue

        # If not found, try auto-generated
        if not transcript:
            try:
                for lang_code in target_codes:
                    for t in transcript_list._generated_transcripts:
                        if t._language_code == lang_code:
                            transcript = t
                            orig_language = lang_code
                            logger.info(f"Found auto-generated transcript in {lang_code}")
                            break
                    if transcript:
                        break
            except:
                pass

        # If still not found, try to translate from any available transcript
        if not transcript:
            try:
                # Get first available transcript
                transcript = next(iter(transcript_list._manually_created_transcripts.values()))
                orig_language = transcript._language_code
                # Translate to target language
                transcript = transcript.translate(target_codes[0])
                logger.info(f"Translated from {orig_language} to {target_codes[0]}")
            except Exception as e:
                logger.warning(f"Translation attempt failed: {str(e)}")

        if not transcript:
            return jsonify({
                'error': 'No captions available',
                'details': f'Could not find or translate captions for {target_language}'
            }), 404

        # Get transcript text
        captions_text = ' '.join([entry['text'] for entry in transcript.fetch()])

        return jsonify({
            'captions': {
                'original': captions_text,
                'translated': captions_text
            },
            'language': {
                'original': orig_language or target_codes[0],
                'translated': target_codes[0]
            }
        })

    except Exception as e:
        logger.exception(f"Caption fetch error: {str(e)}")
        return jsonify({
            'error': 'Failed to fetch captions',
            'details': str(e)
        }), 500

@app.route('/api/generate-summary', methods=['POST'])
def generate_summary():
    try:
        data = request.get_json()
        captions = data.get('captions')
        language = data.get('language')

        if not captions or not language:
            return jsonify({'error': 'Missing required parameters'}), 400

        summary = generate_summary_from_captions(captions, language)
        return jsonify({'summary': summary})
    except Exception as e:
        logger.exception("Failed to generate summary")
        return jsonify({'error': str(e)}), 500

@app.route('/api/learning/course-summary', methods=['POST'])
def generate_course_summary():
    try:
        data = request.get_json()
        captions = data.get('captions')
        language = data.get('language', '').lower()

        if not captions:
            return jsonify({'error': 'Missing captions'}), 400

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        # Language-specific prompts
        language_prompts = {
            'spanish': "Analyze these Spanish language captions for key Spanish learning concepts",
            'french': "Analyze these French language captions for key French learning concepts",
            'german': "Analyze these German language captions for key German learning concepts",
            'default': f"Analyze these {language} language captions for key language learning concepts"
        }

        base_prompt = language_prompts.get(language, language_prompts['default'])
        
        structured_prompt = f"""{base_prompt}

        Text to analyze: {captions}

        Create a comprehensive language learning analysis that includes:
        1. Key vocabulary with translations and example usage
        2. Grammar patterns and rules demonstrated
        3. Cultural context and insights
        4. Practice exercises and dialogues
        5. Important phrases and expressions
        6. Timeline of topics covered

        Format as JSON with:
        {{
            "mainPoints": ["5-7 key learning points"],
            "keyVocabulary": [
                {{"word": "original word", "meaning": "translation and usage notes"}}
            ],
            "conceptBreakdown": [
                {{"concept": "grammar or usage pattern", "explanation": "detailed explanation with examples"}}
            ],
            "culturalInsights": ["3-5 cultural insights"],
            "practiceExercises": [
                {{
                    "type": "dialogue/exercise type",
                    "description": "complete exercise with examples and translations"
                }}
            ],
            "timeline": [
                {{"time": "MM:SS", "topic": "topic description"}}
            ]
        }}"""

        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": "You are an expert language teacher creating detailed lesson summaries with timelines and practice materials."},
                    {"role": "user", "content": structured_prompt}
                ],
                "temperature": 0.3,
                "max_tokens": 4000,
                "response_format": {"type": "json_object"}
            }
        )

        if not response.ok:
            logger.error(f"Groq API error: {response.text}")
            return jsonify({'error': 'Failed to generate summary'}), response.status_code

        result = response.json()
        content = json.loads(result['choices'][0]['message']['content'])

        # Enhanced response structure with timeline and practice materials
        formatted_response = {
            "summary": {
                "mainPoints": content.get("mainPoints", []),
                "keyVocabulary": content.get("keyVocabulary", []),
                "conceptBreakdown": content.get("conceptBreakdown", []),
                "culturalInsights": content.get("culturalInsights", []),
                "practiceExercises": content.get("practiceExercises", [])
            },
            "timestamps": content.get("timeline", [{"time": "0:00", "topic": "Start of lesson"}])
        }

        return jsonify(formatted_response)

    except Exception as e:
        logger.exception("Failed to generate course summary")
        error_msg = str(e)
        logger.error(f"Error details: {error_msg}")
        return jsonify({
            'error': 'Failed to generate summary',
            'details': error_msg
        }), 500

@app.route('/api/practice/generate', methods=['POST'])
def generate_practice():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        language = data.get('language')
        level = data.get('level')
        exercise_type = data.get('type')

        logger.info(f"Generating practice for {language} {level} {exercise_type}")

        if not all([language, level, exercise_type]):
            return jsonify({'error': 'Missing required parameters'}), 400

        exercises = practice_service.generate_exercises(language, level, exercise_type)
        
        # Validate response structure
        if not exercises or 'exercises' not in exercises or not exercises['exercises']:
            logger.error(f"Invalid exercise data generated: {exercises}")
            return jsonify({'error': 'Failed to generate valid exercises'}), 500

        logger.info(f"Successfully generated {len(exercises['exercises'])} exercises")
        return jsonify(exercises)

    except Exception as e:
        logger.exception("Failed to generate practice exercises")
        return jsonify({'error': str(e)}), 500

def generate_summary_from_captions(captions: str, language: str) -> str:
    try:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        prompt = f"Generate a summary for the following captions in {language}:\n\n{captions}"

        response = requests.post(
            GROQ_API_ENDPOINT,
            headers=headers,
            json={
                "prompt": prompt,
                "max_tokens": 150
            }
        )

        if response.status_code == 200:
            result = response.json()
            return result['choices'][0]['text'].strip()
        return "Summary not available."
    except Exception as e:
        logger.error(f"Error generating summary: {str(e)}")
        return "Summary not available."

def fetch_youtube_captions(video_id: str) -> str:
    try:
        # Replace with actual YouTube API call to fetch captions
        # This is a placeholder implementation
        response = requests.get(f"https://www.youtube.com/api/timedtext?lang=en&v={video_id}")
        if response.status_code == 200:
            return response.text
        return "Captions not available."
    except Exception as e:
        logger.error(f"Error fetching captions: {str(e)}")
        return "Captions not available."

@app.errorhandler(Exception)
def handle_error(error):
    logger.exception("An error occurred:")
    response = {
        "error": str(error),
        "status": "error"
    }
    return jsonify(response), 500

if __name__ == '__main__':
    # Update host and port configuration
    app.run(host='0.0.0.0', port=5000, debug=True)