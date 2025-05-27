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

5- Lancacement du serveur

```
uvicorn main:app --reload
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

