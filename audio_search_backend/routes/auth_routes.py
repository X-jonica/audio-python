import jwt
import datetime
from flask import Blueprint, request, jsonify, current_app
from models.models import db, User
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    name = data.get('name')
    password = data.get('password')

    if not email or not name or not password:
        return jsonify({"message": "Tous les champs sont requis"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email déjà utilisé"}), 400

    hashed_password = generate_password_hash(password)
    user = User(name=name, email=email, password=hashed_password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Inscription réussie"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email et mot de passe requis"}), 400

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password, password):
        # Génération du token JWT (valide 24h ici)
        payload = {
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }
        token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

        user_data = {
            'id': user.id,
            'email': user.email,
            'name': user.name
        }

        return jsonify({
            "message": "Connexion réussie",
            "token": token,
            "user": user_data
        }), 200

    return jsonify({"message": "Email ou mot de passe invalide"}), 401

@auth_bp.route('/set-audd-key', methods=['POST'])
def set_audd_key():
    data = request.get_json()
    audd_key = data.get('audd_key')

    if not audd_key:
        return jsonify({"message": "La clé AUDD est requise"}), 400

    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"message": "Token requis"}), 401

    try:
        if token.startswith("Bearer "):
            token = token.split(" ")[1]
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = payload['user_id']
    except Exception:
        return jsonify({"message": "Token invalide"}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "Utilisateur introuvable"}), 404

    user.audd_key = audd_key
    db.session.commit()

    return jsonify({
        "message": "Clé AUDD mise à jour avec succès",
        "audd_key": user.audd_key  # optionnel
    }), 200

