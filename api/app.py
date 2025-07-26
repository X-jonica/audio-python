from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from models.models import db, History
from routes.auth_routes import auth_bp
from routes.historique_routes import historique_bp
from sqlalchemy import text
from werkzeug.utils import secure_filename
from bs4 import BeautifulSoup
import requests
import base64
import os
import numpy as np
import tensorflow as tf
import tensorflow_hub as hub
import librosa
import pandas as pd

# === Initialisation de l'application Flask ===
app = Flask(__name__)
app.config.from_object(Config)

# === Activation de CORS pour le frontend ===
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],
        "methods": ["GET", "POST", "PUT","DELETE", "OPTIONS"],
        "allow_headers": ["*"]
    }
})

# === Middleware CORS pour OPTIONS ===
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

# === Initialisation de la base de données ===
db.init_app(app)

# === Dossier d'upload ===
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# === Clés API ===
AUDD_API_TOKEN = '0fd99038f390e8b309cb872974d5ed91'
GENIUS_API_TOKEN = '4PV0qIptp2pzaUZxMttK_AAUcJJAW1cn9oV4R2_dHeSRAiYH5IFN8Bbpw3cwWEtz'

# === Lazy loading de YAMNet ===
yamnet_model = None
class_names = None

def get_yamnet_model():
    global yamnet_model, class_names
    if yamnet_model is None or class_names is None:
        yamnet_model = hub.load('https://tfhub.dev/google/yamnet/1')
        class_map_path = tf.keras.utils.get_file(
            'yamnet_class_map.csv',
            'https://raw.githubusercontent.com/tensorflow/models/master/research/audioset/yamnet/yamnet_class_map.csv'
        )
        class_names = pd.read_csv(class_map_path)['display_name'].tolist()
    return yamnet_model, class_names

# === Analyse locale YAMNet ===
def analyze_audio_yamnet(file_path):
    try:
        waveform, sr = librosa.load(file_path, sr=16000, mono=True)
        model, class_names = get_yamnet_model()
        scores, embeddings, spectrogram = model(waveform)
        mean_scores = tf.reduce_mean(scores, axis=0)
        top_indices = tf.argsort(mean_scores, direction='DESCENDING')[:5]

        return [
            {
                "label": class_names[i],
                "score": float(mean_scores[i])
            }
            for i in top_indices
        ]

    except Exception as e:
        print("Erreur YAMNet:", e)
        return []

# === Reconnaissance principale avec API + YAMNet ===
def recognize_song(file_path):
    try:
        with open(file_path, 'rb') as f:
            encoded_audio = base64.b64encode(f.read()).decode('utf-8')

        response = requests.post("https://api.audd.io/", data={
            'api_token': AUDD_API_TOKEN,
            'audio': encoded_audio,
            'return': 'lyrics,apple_music,spotify',
        })

        result = response.json()
        result["yamnet_prediction"] = analyze_audio_yamnet(file_path)

        return result

    except Exception as e:
        print("Erreur reconnaissance:", e)
        return {'status': 'error', 'message': str(e), 'yamnet_prediction': []}

# === Scraping des paroles ===
def scrape_genius_lyrics(url):
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        lyrics_div = soup.find('div', {'data-lyrics-container': 'true'}) or soup.find('div', class_='lyrics')

        if lyrics_div:
            for br in lyrics_div.find_all('br'):
                br.replace_with('\n')
            return lyrics_div.get_text().strip()

        return None
    except Exception as e:
        print(f"Erreur scraping: {e}")
        return None

# === Obtenir les paroles via Genius ===
def get_genius_lyrics(artist, title):
    headers = {"Authorization": f"Bearer {GENIUS_API_TOKEN}"}
    search_url = f"https://api.genius.com/search?q={artist} {title}"

    try:
        response = requests.get(search_url, headers=headers)
        if response.status_code != 200:
            return None

        hits = response.json()['response']['hits']
        if not hits:
            return None

        song_path = hits[0]['result']['path']
        return scrape_genius_lyrics(f"https://genius.com{song_path}")
    except Exception as e:
        print(f"Erreur API Genius: {e}")
        return None

# === Test de la base ===
with app.app_context():
    try:
        db.create_all()
        db.session.execute(text('SELECT 1'))
        print("✅ Connexion à la base de données réussie.")
    except Exception as e:
        print("❌ Échec de la connexion à la base de données :", e)

# === Reconnaissance + historique ===
@app.route('/api/recognize', methods=['POST'])
def recognize_from_upload():
    if 'audio' not in request.files or 'user_id' not in request.form:
        return jsonify({'error': 'Fichier audio ou identifiant utilisateur manquant'}), 400

    user_id = request.form['user_id']
    file = request.files['audio']
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    result = recognize_song(file_path)

    if result.get('status') == 'success' and result.get('result'):
        song_info = result['result']
        title = song_info.get('title', 'Titre inconnu')
        artist = song_info.get('artist', 'Artiste inconnu')
        youtube_url = song_info.get('youtube', {}).get('url', '') or song_info.get('song_link', '')
        lyrics = get_genius_lyrics(artist, title) or "Paroles non disponibles"

        history = History(title=f"{artist} - {title}", paroles=lyrics, user_id=user_id)
        db.session.add(history)
        db.session.commit()

        return jsonify({
            'title': title,
            'artist': artist,
            'lyrics': lyrics,
            'youtube_url': youtube_url,
            'yamnet_prediction': result.get("yamnet_prediction")
        }), 200

    return jsonify({'message': 'Chanson non reconnue.'}), 404

# === Recherche simple sans historique ===
@app.route('/api/search', methods=['POST'])
def search_only():
    if 'audio' not in request.files:
        return jsonify({'error': 'Fichier audio manquant'}), 400

    file = request.files['audio']
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    result = recognize_song(file_path)

    if result.get('status') == 'success' and result.get('result'):
        song_info = result['result']
        title = song_info.get('title', 'Titre inconnu')
        artist = song_info.get('artist', 'Artiste inconnu')
        youtube_url = song_info.get('youtube', {}).get('url', '') or song_info.get('song_link', '')
        lyrics = get_genius_lyrics(artist, title) or "Paroles non disponibles"

        return jsonify({
            'title': title,
            'artist': artist,
            'lyrics': lyrics,
            'youtube_url': youtube_url,
            'yamnet_prediction': result.get("yamnet_prediction")
        }), 200

    return jsonify({'message': 'Chanson non reconnue.'}), 404

# === Enregistrement des routes supplémentaires ===
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(historique_bp, url_prefix='/api')

@app.route('/')
def home():
    return "Bienvenue sur mon API Flask déployée !"

# === Lancement du serveur ===
if __name__ == '__main__':
    print("Serveur demaré")
    app.run()
