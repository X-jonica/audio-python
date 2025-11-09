from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from models.models import User, History, db
from services.audio_service import recognize_song
from services.lyrics_service import get_genius_lyrics
import os

recognize_bp = Blueprint('recognize', __name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@recognize_bp.route('/recognize', methods=['POST'])
def recognize_from_upload():
    if 'audio' not in request.files or 'user_id' not in request.form:
        return jsonify({'error': 'Fichier audio ou identifiant utilisateur manquant'}), 400

    user_id = request.form['user_id']
    file = request.files['audio']
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    user = User.query.get(user_id)
    audd_token = user.audd_key if user and user.audd_key else None

    result = recognize_song(file_path, audd_token)

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
