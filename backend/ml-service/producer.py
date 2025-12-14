from kafka import KafkaProducer
import json

# Create a Kafka producer
producer = KafkaProducer(
    bootstrap_servers=["kafka:9092"],  # make sure this matches your Docker Compose Kafka hostname
    value_serializer=lambda v: json.dumps(v).encode("utf-8")
)

def send_transcript(text: str):
    payload = {
        "text": text,
        "confidence": 0.92,
        "modelName": "fake-ml-v1",
        "language": "en",
        "audioDuration": 3.4
    }

    producer.send("ml.transcript", value=payload)
    producer.flush()
