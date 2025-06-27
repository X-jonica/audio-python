import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "postgresql://soundwave_owner:npg_zFbkp9YfN5Dn@ep-twilight-art-a8z7occ1-pooler.eastus2.azure.neon.tech/soundwave?sslmode=require&channel_binding=require")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = "SK_7D#x!Gs92kLM&+aPeD$Lz91f*!23AbQklpVXrz"
