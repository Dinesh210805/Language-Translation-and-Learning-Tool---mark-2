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
def chatbot():
    # TODO: Implement chatbot response
    pass

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
    target_language = request.args.get('language', 'es')  # Default to Spanish
    return_original = request.args.get('original', 'true')  # New parameter
    
    if not video_id:
        return jsonify({'error': 'Missing videoId parameter'}), 400

    try:
        # Get Spanish auto-generated captions
        transcript = None
        try:
            transcript = YouTubeTranscriptApi.get_transcript(
                video_id, 
                languages=['es']
            )
        except:
            try:
                transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
                transcript = transcript_list.find_transcript(['es']).fetch()
            except Exception as e:
                logger.error(f"Could not find Spanish captions: {str(e)}")
                return jsonify({'error': 'No Spanish captions available'}), 404

        # Store original Spanish captions
        original_captions = ' '.join([entry['text'] for entry in transcript])

        # If target language is different and original not requested, translate
        translated_captions = original_captions
        if target_language != 'es' and return_original != 'true':
            try:
                transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
                translated = transcript_list.find_transcript(['es']).translate(target_language).fetch()
                translated_captions = ' '.join([entry['text'] for entry in translated])
            except Exception as e:
                logger.error(f"Translation failed: {str(e)}")
                # Fall back to original if translation fails
                
        return jsonify({
            'captions': {
                'original': original_captions,
                'translated': translated_captions if target_language != 'es' else original_captions
            },
            'language': {
                'original': 'es',
                'translated': target_language
            }
        })
    except Exception as e:
        logger.exception(f"Failed to fetch captions: {str(e)}")
        return jsonify({'error': 'Could not retrieve captions'}), 500

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
        language = data.get('language')

        if not captions or not language:
            return jsonify({'error': 'Missing required parameters'}), 400

            # Process captions with Groq LLM
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        structured_prompt = f"""You are a language learning expert. Analyze these {language} captions and create a detailed educational summary:

{captions}

Create a comprehensive analysis that includes:

1. Main learning points (list at least 5 key takeaways)
2. Vocabulary breakdown (include words with their translations and example usage)
3. Grammar concepts explained
4. Cultural context and insights
5. Practical exercises for learners

Format the response as JSON with this exact structure:
{{
    "mainPoints": ["point1", "point2", ...],
    "keyVocabulary": [
        {{"word": "term1", "meaning": "translation1"}},
        {{"word": "term2", "meaning": "translation2"}}
    ],
    "conceptBreakdown": [
        {{"concept": "Grammar Rule 1", "explanation": "Detailed explanation"}},
        {{"concept": "Usage Pattern", "explanation": "How and when to use it"}}
    ],
    "culturalInsights": ["insight1", "insight2", ...],
    "practiceExercises": [
        {{"type": "Exercise Type 1", "description": "Exercise instructions"}},
        {{"type": "Exercise Type 2", "description": "Exercise instructions"}}
    ]
}}
Make sure to include practical examples and clear explanations."""

        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": "You are a professional language teacher creating detailed lesson summaries."},
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

        # Ensure all required fields are present with defaults if missing
        formatted_response = {
            "summary": {
                "mainPoints": content.get("mainPoints", ["Main points will be generated based on the content"]),
                "keyVocabulary": content.get("keyVocabulary", [{"word": "Loading...", "meaning": "Generating vocabulary"}]),
                "conceptBreakdown": content.get("conceptBreakdown", [{"concept": "Loading...", "explanation": "Analyzing grammar concepts"}]),
                "culturalInsights": content.get("culturalInsights", ["Analyzing cultural context..."]),
                "practiceExercises": content.get("practiceExercises", [{"type": "Practice", "description": "Generating exercises..."}])
            },
            "timestamps": [{"time": "00:00", "topic": "Lesson Start"}]
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