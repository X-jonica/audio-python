from fastapi import FastAPI 

app = FastAPI()

@app.get("/")
def read_root():
  return {"message": "Bonjour dans notre API musicale avec IA 🧠🎵, j'ai modifier ceci"}