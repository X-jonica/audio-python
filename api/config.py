import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "postgresql://postgres:motdepasse@localhost:5432/musicapp")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = "SK_7D#x!Gs92kLM&+aPeD$Lz91f*!23AbQklpVXrz"
