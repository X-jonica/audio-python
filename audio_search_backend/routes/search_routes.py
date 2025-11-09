from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from services.audio_service import recognize_song
from services.lyrics_service import get_genius_lyrics
from models.models import User
import os

search_bp = Blueprint('search', __name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@search_bp.route('/search', methods=['POST'])
def search_only():
    if 'audio' not in request.files or 'user_id' not in request.form:
        return jsonify({'error': 'Fichier audio ou identifiant utilisateur manquant'}), 400

    user_id = request.form['user_id']
    user = User.query.get(user_id)
    if not user or not user.audd_key:
        return jsonify({'error': 'Clé AUDD de l’utilisateur introuvable'}), 400

    file = request.files['audio']
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    # Utilise toujours la clé de l’utilisateur
    result = recognize_song(file_path, user.audd_key)

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
