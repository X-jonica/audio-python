from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import requests
import base64
from bs4 import BeautifulSoup
from models.models import db, Historique 

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Configurez vos clés API ici
AUDD_API_TOKEN = '42fb6840c6985d242ffa8f6d571a5879'
GENIUS_API_TOKEN = 'AOzwNqHayVDaIa9VW_YJ9ln65RO145FMn7X0W81uzOi5BoKQG_xvZdvSC8ihLjMF'

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
        
        # Nouvelle structure des paroles sur Genius
        lyrics_div = soup.find('div', {'data-lyrics-container': 'true'})
        if not lyrics_div:
            # Ancienne structure de paroles
            lyrics_div = soup.find('div', class_='lyrics')
        
        if lyrics_div:
            # Nettoyage des paroles
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
        
        # Scraping des paroles depuis la page
        return scrape_genius_lyrics(lyrics_url)
        
    except Exception as e:
        print(f"Erreur API Genius: {e}")
        return None

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
        
        # Récupération des paroles
        lyrics = get_genius_lyrics(artist, title) or "Paroles non disponibles"

        # 🔥 Enregistrer dans l’historique
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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)