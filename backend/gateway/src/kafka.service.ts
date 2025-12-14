import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import Redis from 'ioredis';

@Injectable()
export class KafkaService implements OnModuleInit {
    private readonly logger = new Logger(KafkaService.name);

    private kafka = new Kafka({
        clientId: 'gateway',
        brokers: ['kafka:9092'],
    });

    private producer = this.kafka.producer();
    private redis = new Redis({ host: 'redis', port: 6379 });

    async onModuleInit() {
        await this.producer.connect();
        this.logger.log('Kafka Producer Connected');
    }

    async sendToML(buffer: Buffer) {
        await this.producer.send({
            topic: 'audio.chunk',
            messages: [{ value: buffer }],
        });
    }

    async getLatestTranscript(): Promise<string | null> {
        return this.redis.get('latest-transcript');
    }
}
