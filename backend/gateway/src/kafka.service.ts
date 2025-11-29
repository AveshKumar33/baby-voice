import { Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaService {
    kafka = new Kafka({
        brokers: ['kafka:9092'],
    });

    producer = this.kafka.producer();
    consumer = this.kafka.consumer({ groupId: 'gateway-consumer' });

    async onModuleInit() {
        await this.producer.connect();
        await this.consumer.connect();

        await this.consumer.subscribe({ topic: 'ml.transcript', fromBeginning: false });

        // ML → Gateway → Frontend
        this.consumer.run({
            eachMessage: async ({ message }) => {
                global['gatewaySocket'].emit("transcript", message?.value?.toString());
            },
        });
    }

    sendToML(textBuffer: Buffer) {
        return this.producer.send({
            topic: 'audio.chunk',
            messages: [{ value: textBuffer }],
        });
    }
}
