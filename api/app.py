from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from models.models import db, Historique
from routes.auth_routes import auth_bp
from routes.historique_routes import historique_bp
from sqlalchemy import text
import os
from werkzeug.utils import secure_filename
import requests
import base64
from bs4 import BeautifulSoup
from flask_cors import CORS


# Initialisation de l'application
app = Flask(__name__)
app.config.from_object(Config)
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})
# Configuration de la base de données
db.init_app(app)

# Configuration du dossier d'upload
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Clés API
AUDD_API_TOKEN = 'da6969d0632020f9d86d7e191ff8c280'
GENIUS_API_TOKEN = '4PV0qIptp2pzaUZxMttK_AAUcJJAW1cn9oV4R2_dHeSRAiYH5IFN8Bbpw3cwWEtz'

# Vérification de la connexion à la base de données
with app.app_context():
    try:
        db.create_all()
        db.session.execute(text('SELECT 1')) 
        print("✅ Connexion à la base de données réussie.")
    except Exception as e:
        print("❌ Échec de la connexion à la base de données :", e)

# Fonctions pour la reconnaissance musicale
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
    return response.json()

def scrape_genius_lyrics(url):
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        lyrics_div = soup.find('div', {'data-lyrics-container': 'true'})
        if not lyrics_div:
            lyrics_div = soup.find('div', class_='lyrics')
        
        if lyrics_div:
            for br in lyrics_div.find_all('br'):
                br.replace_with('\n')
            return lyrics_div.get_text().strip()
        return None
    except Exception as e:
        print(f"Erreur lors du scraping: {e}")
        return None

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

# Routes pour la reconnaissance musicale
@app.route('/api/recognize', methods=['POST'])
def recognize_from_upload():
    if 'audio' not in request.files or 'utilisateur_id' not in request.form:
        return jsonify({'error': 'Fichier audio ou utilisateur manquant'}), 400

    utilisateur_id = request.form['utilisateur_id']
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

        historique = Historique(
            titre=f"{artist} - {title}",
            paroles=lyrics,
            utilisateur_id=utilisateur_id
        )
        db.session.add(historique)
        db.session.commit()

        return jsonify({
            'title': title,
            'artist': artist,
            'lyrics': lyrics,
            'youtube_url': youtube_url
        })

    return jsonify({'message': 'Chanson non reconnue.'}), 404

@app.route('/api/search', methods=['POST'])
def search_only():
    print("Requête reçue sur /api/search")
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
            'youtube_url': youtube_url
        })

    return jsonify({'message': 'Chanson non reconnue.'}), 404

# Enregistrement des blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(historique_bp, url_prefix='/api')

if __name__ == '__main__':
    print("🚀 Serveur Flask lancé sur http://localhost:8000")
    app.run(host='0.0.0.0', port=8000, debug=True)