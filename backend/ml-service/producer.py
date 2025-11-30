from kafka import KafkaProducer

producer = KafkaProducer(
    bootstrap_servers=["kafka:9092"]
)

def send_transcript(text: str):
    print("ML Service: Sending transcript to Kafka...")
    producer.send(
        "ml.transcript",
        value=text.encode("utf-8")
    )
    producer.flush()
