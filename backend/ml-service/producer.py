from confluent_kafka import Producer

config = {
    "bootstrap.servers": "kafka:9092"
}

producer = Producer(config)

def send_transcript(text: str):
    producer.produce("ml.transcript", value=text.encode("utf-8"))
    producer.flush()
