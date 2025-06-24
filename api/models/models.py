from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Utilisateur(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(50))
    email = db.Column(db.String(120), unique=True, nullable=False)
    mot_de_passe = db.Column(db.Text, nullable=False)
    historiques = db.relationship('Historique', backref='utilisateur', lazy=True)

class Historique(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titre = db.Column(db.String(200))
    paroles = db.Column(db.Text)
    date_recherche = db.Column(db.DateTime, default=datetime.utcnow)
    utilisateur_id = db.Column(db.Integer, db.ForeignKey('utilisateur.id'), nullable=False)
