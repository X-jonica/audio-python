import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "postgresql://postgres:motdepasse@localhost:5432/musicapp")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = "ma_super_cle_tres_secrete_123456"
