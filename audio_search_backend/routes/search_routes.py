from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from services.audio_service import recognize_song
from services.lyrics_service import get_genius_lyrics
from models.models import User
import os

# === Blueprint ===
search_bp = Blueprint('search', __name__)

# === Dossier d'upload ===
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# === Clé publique pour recherche générale ===
AUDD_KEY_PUBLIC = "1e128b3404e0f278e55d9a25074e0189"


# === ROUTE : recherche publique (ne nécessite pas d'utilisateur) ===
@search_bp.route('/search', methods=['POST'])
def public_search():
    if 'audio' not in request.files:
        return jsonify({'error': 'Fichier audio manquant'}), 400

    file = request.files['audio']
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    # Recherche avec clé publique
    result = recognize_song(file_path, AUDD_KEY_PUBLIC)

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