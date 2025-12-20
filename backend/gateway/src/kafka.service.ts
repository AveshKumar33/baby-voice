import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Redis from 'ioredis';

@Injectable()
export class KafkaService implements OnModuleInit {
    private readonly logger = new Logger(KafkaService.name);

    private kafka = new Kafka({
        clientId: 'gateway',
        brokers: ['kafka:9092'],
    });

    private producer = this.kafka.producer();
    private consumer = this.kafka.consumer({ groupId: 'gateway-service-group' });
    private redis = new Redis({ host: 'redis', port: 6379 });

    constructor(private eventEmitter: EventEmitter2) { }

    async onModuleInit() {
        await this.producer.connect();
        this.logger.log('Kafka Producer Connected');

        await this.consumer.connect();
        this.logger.log('Kafka Consumer Connected');

        await this.consumer.subscribe({ topic: 'gateway.transcript' });

        await this.consumer.run({
            eachMessage: async ({ message }) => {
                if (!message.value) return;
                const parsed = JSON.parse(message.value.toString());
                /** Save latest transcript in Redis */
                // const redisData = await this.redis.get('latest-transcript', parsed.text);
                // console.log('Avesg redis data:::--->>>', redisData);
                /** 🔥 Emit event to AppGateway */
                this.eventEmitter.emit('newTranscript', parsed.text);
                this.logger.log('Transcript received & event emitted:', parsed.text);
            },
        });
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
