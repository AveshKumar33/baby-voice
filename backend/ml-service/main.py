import sys
import time
from kafka import KafkaConsumer
from producer import send_transcript

print("ML Service: Starting Kafka consumer...")

# Consumer listens to 'audio.chunk'
consumer = KafkaConsumer(
    "audio.chunk",
    bootstrap_servers=["kafka:9092"],
    auto_offset_reset="latest",
    enable_auto_commit=True,
    group_id="ml-service-group"
)

print("ML Service: Waiting for audio messages...")

for msg in consumer:
    try:
        audio_bytes = msg.value  # raw audio chunk

        # TODO: Run ML speech-to-text here
        fake_text = "This is a test transcript from ML service."

        print("ML Service: Processed audio →", fake_text)

        # Push text → Kafka topic: ml.transcript
        send_transcript(fake_text)

    except Exception as e:
        print("ML Service Error:", e)
        time.sleep(1)
