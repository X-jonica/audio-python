##Etape 1 : Mise en place des environnements de developpement et teste de la premiere requete GET avec FastAPI

1- mise en place de l'environement de developpement

```
python -m venv env
```

2- Activation de l'environnement de developpement

```
./env/Scripts/activate
```

3- Installation des bibliotheques de base

```
pip install fastapi uvicorn[standard] python-dotenv
```

4- Creation du fichier requirements.txt

```
pip freeze > requirements.txt
```

5- Lancacement du backend

```
python main.py
```

##Etape 2 : Integré PostgreSQL avec SQLAlchemy
1- Installation les dépendances nécessaires

```
pip install sqlalchemy psycopg2-binary alembic
```

---

## Creation du modele de reseau de neurone

installation des packages necessaires

```
pip install torch torchaudio librosa openl3 numpy scikit-learn
```

## Debuter le developpement du backend avec Flask

### 🧱 Étape 1 : Choix des outils

-   Flask : le micro-framework web
-   Flask SQLAlchemy : ORM pour gérer PostgreSQL
-   Flask-Migrate : pour les migrations de base de données
-   psycopg2 : pilote PostgreSQL
-   Werkzeug.security : pour le hachage des mots de passe

### 📦 Étape 2 : Installer les dépendances

```
pip install Flask Flask-SQLAlchemy Flask-Migrate psycopg2-binary Flask-Cors Werkzeug

```

### ⚙️ Étape 3 : Configuration de la base de données – config.py

### 🔧 Étape 4 : Définir les modèles – models/models.py

### 🔐 Étape 5 : Authentification – routes/auth_routes.py

### 📚 Étape 6 : Historique – routes/historique_routes.py

### ➡️ Etape 7 : Création de app.py et modification dans main.py

### 🔥 Etape 8 : Creation d'un script de lancement (run.sh ou start.bat)

```
pip install python-dotenv
```

---

### 🦿 Etape 9 : installation du pyjwt pour la securisation en utilisant un token :

```
pip install pyjwt
```
