from flask import Blueprint, request, jsonify
from models.models import db, Utilisateur
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data['email']
    nom = data['nom']
    password = generate_password_hash(data['password'])

    if Utilisateur.query.filter_by(email=email).first():
        return jsonify({"message": "Email déjà utilisé"}), 400

    user = Utilisateur(nom=nom, email=email, mot_de_passe=password)
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "Inscription réussie"})

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = Utilisateur.query.filter_by(email=data['email']).first()

    if user and check_password_hash(user.mot_de_passe, data['password']):
        return jsonify({"message": "Connexion réussie", "user_id": user.id})
    return jsonify({"message": "Email ou mot de passe invalide"}), 401
