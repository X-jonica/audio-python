# Importation des bibliothèques nécessaires
import requests  # Pour faire des requêtes HTTP
import os  # Pour accéder aux fichiers dans un dossier
from bs4 import BeautifulSoup  # Pour faire du web scraping sur les pages HTML

# Jetons d'accès à l'API Genius et à l'API Audd.io
GENIUS_API_TOKEN = 'jBzjpT6DuBjYPvG3ihYuyS3tCcRsco9WAUZNrtmUfIE1KKReXQaofJtQnzfbe0A_'
API_TOKEN = 'acf83ee967532e11f23ef61e533f39e8'

# Fonction pour reconnaître une chanson à partir d’un fichier audio
def recognize_song(file_path):
    url = 'https://api.audd.io/'  # URL de l'API Audd.io
    data = {
        'api_token': API_TOKEN,
        'return': 'apple_music,spotify',  # On peut demander plus d'infos (optionnel)
    }
    files = {
        'file': open(file_path, 'rb'),  # Lecture du fichier audio en mode binaire
    }

    # Envoi de la requête POST à l’API Audd.io
    response = requests.post(url, data=data, files=files)
    return response.json()  # Retourne la réponse sous forme JSON

# Fonction pour récupérer les paroles d'une chanson à partir du site Genius
def get_genius_lyrics(artist, title):
    base_url = "https://api.genius.com"
    headers = {'Authorization': 'Bearer ' + GENIUS_API_TOKEN}  # Authentification
    search_url = base_url + "/search"
    data = {'q': f"{artist} {title}"}  # Recherche basée sur artiste + titre

    # Envoi de la requête GET pour chercher la chanson sur Genius
    response = requests.get(search_url, data=data, headers=headers)
    json_resp = response.json()

    # Extraction des résultats de recherche
    hits = json_resp['response']['hits']
    if hits:
        # Prend le chemin de la première chanson trouvée
        song_path = hits[0]['result']['path']
        song_url = "https://genius.com" + song_path  # URL complète vers la page des paroles

        # Télécharge le HTML de la page de paroles
        page = requests.get(song_url)
        html = BeautifulSoup(page.text, 'html.parser')  # Analyse HTML avec BeautifulSoup

        # Ancienne méthode : vérifier la présence d'une div avec la classe 'lyrics'
        lyrics_div = html.find('div', class_='lyrics')
        if lyrics_div:
            return lyrics_div.get_text().strip()
        else:
            # Nouvelle structure (plus moderne) : plusieurs blocs contenant les paroles
            lyrics_div = html.find_all('div', class_=lambda value: value and value.startswith('Lyrics__Container'))
            lyrics = '\n'.join([div.get_text(separator='\n').strip() for div in lyrics_div])
            return lyrics
    return "Paroles non trouvées."  # Aucun résultat trouvé sur Genius

# Fonction principale
def main():
    songs_folder = 'songs'  # Dossier contenant les fichiers audio

    # Parcourt tous les fichiers dans le dossier "songs"
    for filename in os.listdir(songs_folder):
        if filename.endswith(('.mp3', '.wav', '.m4a')):  # Vérifie si c’est un fichier audio supporté
            full_path = os.path.join(songs_folder, filename)
            print(f'Reconnaissance pour: {filename}')
            
            # Appelle la fonction de reconnaissance musicale
            result = recognize_song(full_path)

            # Vérifie si la reconnaissance a réussi
            if result.get('status') == 'success' and result.get('result'):
                song_info = result['result']
                title = song_info.get('title', 'Titre inconnu')
                artist = song_info.get('artist', 'Artiste inconnu')
                print(f'Titre : {title}')
                print(f'Artiste : {artist}')

                # Appelle la fonction pour obtenir les paroles
                lyrics = get_genius_lyrics(artist, title)
                print("\nParoles:\n", lyrics)  # Affiche seulement les 500 premiers caractères
                print("\n" + "="*40 + "\n")
            else:
                print('Chanson non reconnue.\n')

# Point d'entrée du script
if __name__ == '__main__':
    main()
