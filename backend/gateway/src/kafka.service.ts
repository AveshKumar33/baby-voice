import { Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaService {
    kafka = new Kafka({
        brokers: ['kafka:9092'],
    });

    producer = this.kafka.producer();
    consumer = this.kafka.consumer({ groupId: 'gateway-consumers' });

    async onModuleInit() {
        await this.producer.connect();
        await this.consumer.connect();

        await this.consumer.subscribe({ topic: 'ml.transcript' });

        this.consumer.run({
            eachMessage: async ({ message }) => {
                const text = message?.value?.toString();
                global['gatewaySocket'].emit("transcript", text);
            }
        });
    }

    sendToML(buffer: Buffer) {
        return this.producer.send({
            topic: "audio.chunk",
            messages: [{ value: buffer }],
        });
    }
}
