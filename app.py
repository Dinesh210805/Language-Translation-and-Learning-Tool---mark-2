from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from services.translator import GroqTranslator
import os
import logging

app = Flask(__name__)
# Update CORS configuration to be more permissive for development
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "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")
translator = GroqTranslator(GROQ_API_KEY)

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
    # TODO: Implement voice translation
    pass

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

if __name__ == '__main__':
    # Update host and port configuration
    app.run(host='0.0.0.0', port=5000, debug=True)