from fastapi import FastAPI 

app = FastAPI()
hello = "hello"

@app.get("/")
def read_root():
  return {"message": "Bonjour dans notre API musicale avec IA 🧠🎵, faniry"}