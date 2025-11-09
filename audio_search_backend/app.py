# app.py
from flask import Flask
from flask_cors import CORS
from config import Config
from models.models import db
from flask_migrate import Migrate

# --- Création de l'application Flask ---
app = Flask(__name__)
app.config.from_object(Config)

# --- Activation de CORS pour le frontend ---
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --- Initialisation de la base de données ---
db.init_app(app)
migrate = Migrate(app, db)

# --- Import des blueprints après la création de app ---
from routes.auth_routes import auth_bp
from routes.historique_routes import historique_bp
from routes.recognize_routes import recognize_bp
from routes.search_routes import search_bp

# --- Enregistrement des blueprints ---
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(historique_bp, url_prefix='/api')
app.register_blueprint(recognize_bp, url_prefix='/api')
app.register_blueprint(search_bp, url_prefix='/api')

# --- Route principale pour tester le backend ---
@app.route('/')
def home():
    return "Bienvenue sur l'API Flask Audio Search !"

# --- Test de la base de données au démarrage ---
with app.app_context():
    try:
        db.create_all()
        print("✅ Base de données initialisée avec succès.")
    except Exception as e:
        print("❌ Échec de la connexion à la base de données :", e)

# --- Lancement du serveur ---
if __name__ == '__main__':
    print("Serveur démarré sur http://127.0.0.1:5000")
    app.run(debug=True)
