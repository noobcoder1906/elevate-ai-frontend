from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import random
import json
import pickle
import numpy as np
import re
import nltk
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords

# Initialize FastAPI app
app = FastAPI()

# CORS Middleware
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend's URL if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Preprocessing setup
nltk.download("stopwords")
nltk.download("wordnet")
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words("english"))
critical_terms = {"sad", "cry", "depressed", "hopeless", "am"}
stop_words -= critical_terms

def preprocess_text(text):
    text = re.sub(r"http\S+|www\S+|https\S+", "", text)
    text = re.sub(r"[^\w\s]", "", text)
    text = re.sub(r"\d+", "", text)
    text = re.sub(r"(.)\1{2,}", r"\1\1", text)
    text = text.lower()
    words = text.split()
    words = [word for word in words if word not in stop_words]
    words = [lemmatizer.lemmatize(word) for word in words if len(word) > 2]
    return " ".join(words)

# Load resources
base_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_dir, "chatbot_model_with_glove1.h5")
tokenizer_path = os.path.join(base_dir, "tokenizer1.pkl")
classes_path = os.path.join(base_dir, "classes1.pkl")
intents_path = os.path.join(base_dir, "intents1.json")

with open(intents_path, "r") as f:
    intents = json.load(f)

tokenizer = pickle.load(open(tokenizer_path, "rb"))
classes = pickle.load(open(classes_path, "rb"))
model = load_model(model_path)

# API Models
class ChatRequest(BaseModel):
    message: str

# Prediction Logic
def predict_class(sentence):
    preprocessed_sentence = preprocess_text(sentence)
    sequence = tokenizer.texts_to_sequences([preprocessed_sentence])
    sequence_padded = pad_sequences(sequence, maxlen=model.input_shape[1], padding="post")
    predictions = model.predict(sequence_padded)[0]
    ERROR_THRESHOLD = 0.25
    results = [[i, r] for i, r in enumerate(predictions) if r > ERROR_THRESHOLD]
    results.sort(key=lambda x: x[1], reverse=True)
    return [{"intent": classes[r[0]], "probability": str(r[1])} for r in results]

def get_response(intents_list):
    if not intents_list:
        return "I'm here to help, but I didn't quite understand that."

    tag = intents_list[0]["intent"]
    for intent in intents["intents"]:
        if intent["tag"] == tag:
            return random.choice(intent["responses"])
    
    # Log unmatched tag
    print(f"Unmatched tag: {tag}")
    return "I'm here to help, but I didn't quite understand that."

@app.post("/api/chatbot")
async def chatbot_response(request: ChatRequest):
    try:
        print(f"Received message: {request.message}")
        
        # Predict intents
        intents_list = predict_class(request.message)
        print(f"Predicted intents: {intents_list}")

        # Generate response
        response = get_response(intents_list)
        print(f"Response generated: {response}")
        
        return {"response": response}

    except KeyError as ke:
        print(f"KeyError: {ke}")
        raise HTTPException(status_code=500, detail="Key error in processing.")
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
