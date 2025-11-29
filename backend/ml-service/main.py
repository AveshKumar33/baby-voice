from fastapi import FastAPI, UploadFile
from producer import send_transcript

app = FastAPI()

@app.get("/")
def home():
    return {"message": "ML Service Running"}

@app.post("/process-audio")
async def process_audio(file: UploadFile):
    # Dummy ML prediction for now
    fake_text = "This is a test transcript from ML service."

    # send to Kafka
    send_transcript(fake_text)

    return {"transcript": fake_text}
