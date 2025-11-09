import requests
from bs4 import BeautifulSoup

GENIUS_API_TOKEN = '4PV0qIptp2pzaUZxMttK_AAUcJJAW1cn9oV4R2_dHeSRAiYH5IFN8Bbpw3cwWEtz'

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
