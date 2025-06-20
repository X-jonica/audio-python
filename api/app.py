from flask import Flask
from flask_cors import CORS
from config import Config
from models.models import db
from routes.auth_routes import auth_bp
from routes.historique_routes import historique_bp
from sqlalchemy import text 

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

db.init_app(app)

with app.app_context():
    try:
        db.create_all()
        db.session.execute(text('SELECT 1')) 
        print("✅ Connexion à la base de données réussie.")
    except Exception as e:
        print("❌ Échec de la connexion à la base de données :", e)

# Enregistrement des routes
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(historique_bp, url_prefix='/api')

if __name__ == '__main__':
    print("🚀 Serveur Flask lancé sur http://localhost:8000")
    app.run(debug=True, port=8000)
