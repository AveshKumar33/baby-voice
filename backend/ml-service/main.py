import time
import os
import numpy as np
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable

from producer import send_transcript

KAFKA_BOOTSTRAP = os.getenv(
    "KAFKA_BOOTSTRAP_SERVERS", "kafka:9092"
).split(",")

AUDIO_TOPIC = "audio.chunk"
GROUP_ID = "ml-service-group"

BYTE_THRESHOLD = 16000
VOLUME_THRESHOLD = 500
MAX_WAIT_SECONDS = 2.0


def create_consumer():
    while True:
        try:
            consumer = KafkaConsumer(
                AUDIO_TOPIC,
                bootstrap_servers=KAFKA_BOOTSTRAP,
                auto_offset_reset="latest",
                enable_auto_commit=True,
                group_id=GROUP_ID,
            )
            print("✅ ML Service: Kafka consumer connected")
            return consumer
        except NoBrokersAvailable:
            print("⏳ ML Service: Kafka not ready, retrying in 5s...")
            time.sleep(5)


def is_voice(audio_bytes: bytes) -> bool:
    total_len = len(audio_bytes)
    valid_length = total_len - (total_len % 2)

    print(f"🔍 VAD: buffer={total_len} bytes, valid={valid_length} bytes")

    if valid_length < 2:
        print("⚠️ VAD: not enough data to analyze")
        return False

    samples = np.frombuffer(audio_bytes[:valid_length], dtype=np.int16)
    avg_amplitude = np.mean(np.abs(samples))

    print(f"🔊 VAD: avg_amplitude={avg_amplitude:.2f}")

    is_voice_detected = avg_amplitude > VOLUME_THRESHOLD
    print(
        "🗣️ VAD RESULT:",
        "VOICE DETECTED" if is_voice_detected else "SILENCE",
    )

    return is_voice_detected


def main():
    consumer = create_consumer()
    print("🎧 ML Service: Waiting for audio messages...")

    audio_buffer = bytearray()
    last_flush_time = time.time()

    for msg in consumer:
        if not msg.value:
            print("⚠️ Empty Kafka message received, skipping")
            continue

        print(f"📦 Kafka chunk received: {len(msg.value)} bytes")

        audio_buffer.extend(msg.value)

        buffer_len = len(audio_buffer)
        elapsed = time.time() - last_flush_time

        print(
            f"🧠 Buffer status: size={buffer_len} bytes, "
            f"elapsed={elapsed:.2f}s"
        )

        should_process = (
            buffer_len >= BYTE_THRESHOLD
            or (elapsed >= MAX_WAIT_SECONDS and buffer_len > 0)
        )

        if not should_process:
            continue

        print("⚙️ Processing audio buffer...")

        if is_voice(audio_buffer):
            text = "This is a fake text transcript from ML service."
            print("✅ ML Service: Sending transcript →", text)
            send_transcript(text)
        else:
            print("❌ ML Service: Silence detected, nothing sent")

        audio_buffer.clear()
        last_flush_time = time.time()
        print("🧹 Buffer cleared\n")


if __name__ == "__main__":
    main()
