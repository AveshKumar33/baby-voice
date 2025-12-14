import time
from kafka import KafkaConsumer
from kafka import KafkaProducer
from kafka.errors import KafkaError

from producer import send_transcript

producer = KafkaProducer(bootstrap_servers=["kafka:9092"])

print("ML Service: Waiting for Kafka to be ready...")

while True:
    try:
        consumer = KafkaConsumer(
            "audio.chunk",
            bootstrap_servers=["kafka:9092"],
            auto_offset_reset="latest",
            enable_auto_commit=True,
            group_id="ml-service-group"
        )
        print("ML Service: Connected to Kafka!")
        break
    except KafkaError:
        print("Kafka not ready, retrying in 5 seconds...")
        time.sleep(5)

print("ML Service: Waiting for audio messages...")

for msg in consumer:
    try:
        audio_bytes = msg.value
        fake_text = "This is a test transcript from ML service."
        print("ML Service: Processed audio →", fake_text)
        send_transcript(fake_text)
    except Exception as e:
        print("ML Service Error:", e)
        time.sleep(1)
