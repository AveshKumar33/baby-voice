import json
import time
import os
from kafka import KafkaProducer
from kafka.errors import NoBrokersAvailable

KAFKA_BOOTSTRAP = os.getenv(
    "KAFKA_BOOTSTRAP_SERVERS", "kafka:9092"
).split(",")

TOPIC = "ml.transcript"

_producer = None


def get_producer():
    global _producer

    if _producer:
        print("♻️ ML Producer: Reusing existing Kafka producer")
        return _producer

    print(f"🚀 ML Producer: Connecting to Kafka → {KAFKA_BOOTSTRAP}")

    while True:
        try:
            _producer = KafkaProducer(
                bootstrap_servers=KAFKA_BOOTSTRAP,
                value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            )
            print("✅ ML Producer: Kafka producer connected")
            return _producer
        except NoBrokersAvailable:
            print("⏳ ML Producer: Kafka not ready, retrying in 5s...")
            time.sleep(5)


def send_transcript(text: str):
    print("📤 ML Producer: Preparing transcript message")

    producer = get_producer()

    payload = {
        "text": text,
        "confidence": 0.92,
        "modelName": "fake-ml-v1",
        "language": "en",
        "audioDuration": 3.4,
    }

    print("📦 ML Producer: Payload →", payload)
    print(f"📨 ML Producer: Sending to topic '{TOPIC}'")

    future = producer.send(TOPIC, value=payload)

    try:
        record_metadata = future.get(timeout=10)
        print(
            f"✅ ML Producer: Message delivered | "
            f"topic={record_metadata.topic}, "
            f"partition={record_metadata.partition}, "
            f"offset={record_metadata.offset}"
        )
    except Exception as e:
        print("❌ ML Producer: Failed to send message →", str(e))

    producer.flush()
    print("🧹 ML Producer: Flush complete\n")
