import os
import random
import json
import pickle
import numpy as np
import re
import nltk
from flask import Flask, render_template, request, jsonify
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from tensorflow.keras.preprocessing.text import Tokenizer

# Initialize Flask app
app = Flask(__name__)

# Download necessary NLTK resources
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('punkt')

# Initialize lemmatizer and stopwords
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

# Keep domain-specific terms
critical_terms = {"sad", "cry", "depressed", "hopeless", 'am'}
stop_words = stop_words - critical_terms

# Additional custom stopwords
additional_stopwords = {'life', 'something', 'anything', 'aand', 'abt', 'ability', 'academic', 'able', 'account', 'advance'}
stop_words.update(additional_stopwords)

# Text Preprocessing
def preprocess_text(text):
    text = re.sub(r"http\S+|www\S+|https\S+", '', text)  # Remove URLs
    text = re.sub(r'[^\w\s]', '', text)  # Remove non-alphabetic characters
    text = re.sub(r'\d+', '', text)  # Remove numbers
    text = re.sub(r'_+', '', text)  # Remove underscores
    text = re.sub(r'(.)\1{2,}', r'\1\1', text)  # Reduce repeated characters
    text = text.lower()
    
    words = text.split()
    words = [word for word in words if word not in stop_words]  # Remove stopwords
    words = [word for word in words if len(word) > 2]  # Remove very short words

    # Ensure "no friends" is kept together
    text = ' '.join(words)
    text = re.sub(r'\b(no friends|got no friends|i got no friend)\b', 'no_friends', text)

    return text.strip()


# Load chatbot resources
base_dir = os.path.dirname(os.path.abspath(__file__))
intents_path = os.path.join(base_dir, 'intents1.json')
model_path = os.path.join(base_dir, 'chatbot_model_with_glove1.h5')
tokenizer_path = os.path.join(base_dir, 'tokenizer1.pkl')
classes_path = os.path.join(base_dir, 'classes1.pkl')

try:
    with open(intents_path, 'r') as f:
        intents = json.load(f)
    tokenizer = pickle.load(open(tokenizer_path, 'rb'))
    classes = pickle.load(open(classes_path, 'rb'))
    model = load_model(model_path)
except FileNotFoundError as e:
    print(f"Error: {e}")
    raise

# Predict Intent
def predict_class(sentence):
    """Predicts the intent class of the input"""
    preprocessed_sentence = preprocess_text(sentence)
    sequence = tokenizer.texts_to_sequences([preprocessed_sentence])
    sequence_padded = pad_sequences(sequence, maxlen=model.input_shape[1], padding='post')
    
    res = model.predict(sequence_padded)[0]
    ERROR_THRESHOLD = 0.35# Reduced from 0.25 to improve response selection
    results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]
    results.sort(key=lambda x: x[1], reverse=True)
    
    return [{"intent": classes[r[0]], "probability": str(r[1])} for r in results]

# Get Response
def get_response(intents_list, intents_json):
    """Gets the appropriate response based on predicted intent"""
    if not intents_list or float(intents_list[0]['probability']) < 0.1:
        for i in intents_json['intents']:
            if i['tag'] == "fallback":
                return random.choice(i['responses'])
    tag = intents_list[0]['intent']
    for i in intents_json['intents']:
        if i['tag'] == tag:
            return random.choice(i['responses'])
    return "I'm here to help, but I didn't understand that."

# Flask Routes
@app.route('/')
def index():
    """Render chatbot webpage"""
    return render_template('index.html')

@app.route('/get_response', methods=['POST'])
def chatbot_response():
    """Handle AJAX chatbot responses"""
    user_message = request.form['message']
    intents_list = predict_class(user_message)
    response = get_response(intents_list, intents)
    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(debug=True)
