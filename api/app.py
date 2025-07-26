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
CORS(app, resources={r"/api/*": {"origins": "*"}})

# === Initialisation de la base de données ===
db.init_app(app)

# === Configuration dossier upload ===
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# === Clés API externes ===
AUDD_API_TOKEN = '0fd99038f390e8b309cb872974d5ed91'
GENIUS_API_TOKEN = '4PV0qIptp2pzaUZxMttK_AAUcJJAW1cn9oV4R2_dHeSRAiYH5IFN8Bbpw3cwWEtz'

# === Charger YAMNet une seule fois au démarrage ===
yamnet_model = hub.load('https://tfhub.dev/google/yamnet/1')
class_map_path = tf.keras.utils.get_file(
    'yamnet_class_map.csv',
    'https://raw.githubusercontent.com/tensorflow/models/master/research/audioset/yamnet/yamnet_class_map.csv'
)
class_names = pd.read_csv(class_map_path)['display_name'].tolist()

# === Fonction YAMNet : prédiction des sons présents dans un audio ===
def analyze_audio_yamnet(file_path):
    try:
        waveform, sr = librosa.load(file_path, sr=16000, mono=True)

        # Lancer la prédiction
        scores, embeddings, spectrogram = yamnet_model(waveform)

        # Moyenne des scores sur tout l'audio
        mean_scores = tf.reduce_mean(scores, axis=0)

        # Extraire les 5 sons les plus probables
        top_n = 5
        top_indices = tf.argsort(mean_scores, direction='DESCENDING')[:top_n]

        predictions = [
            {
                "label": class_names[i],
                "score": float(mean_scores[i])
            }
            for i in top_indices
        ]

        return predictions

    except Exception as e:
        print("Erreur YAMNet:", e)
        return []

# === Fonction principale : API audd.io + analyse locale avec YAMNet ===
def recognize_song(file_path):
    with open(file_path, 'rb') as f:
        encoded_audio = base64.b64encode(f.read()).decode('utf-8')

    url = "https://api.audd.io/"
    data = {
        'api_token': AUDD_API_TOKEN,
        'audio': encoded_audio,
        'return': 'lyrics,apple_music,spotify',
    }

    response = requests.post(url, data=data)
    result = response.json()

    # Ajout de la prédiction locale avec YAMNet
    try:
        yamnet_predictions = analyze_audio_yamnet(file_path)
        result["yamnet_prediction"] = yamnet_predictions
    except Exception as e:
        print("Erreur YAMNet :", e)
        result["yamnet_prediction"] = []

    return result

# === Scraping des paroles depuis Genius ===
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

# === Récupération des paroles via Genius ===
def get_genius_lyrics(artist, title):
    headers = {"Authorization": f"Bearer {GENIUS_API_TOKEN}"}
    search_url = f"https://api.genius.com/search?q={artist} {title}"

    try:
        response = requests.get(search_url, headers=headers)
        if response.status_code != 200:
            return None

        data = response.json()
        if not data['response']['hits']:
            return None

        song_path = data['response']['hits'][0]['result']['path']
        lyrics_url = f"https://genius.com{song_path}"
        return scrape_genius_lyrics(lyrics_url)

    except Exception as e:
        print(f"Erreur API Genius: {e}")
        return None

# === Test de connexion à la base ===
with app.app_context():
    try:
        db.create_all()
        db.session.execute(text('SELECT 1'))
        print("✅ Connexion à la base de données réussie.")
    except Exception as e:
        print("❌ Échec de la connexion à la base de données :", e)

# === Endpoint API : reconnaissance avec historique ===
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

        history = History(
            title=f"{artist} - {title}",
            paroles=lyrics,
            user_id=user_id
        )
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

# === Endpoint API : recherche simple sans sauvegarde ===
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

# === Enregistrement des blueprints ===
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(historique_bp, url_prefix='/api')

# === Lancement serveur ===
if __name__ == '__main__':
    print("🚀 Serveur Flask lancé sur http://localhost:8000")
    app.run(host='0.0.0.0', port=8000, debug=True)
