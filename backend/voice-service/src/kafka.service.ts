import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transcript } from './transcript.schema';
import Redis from 'ioredis';

@Injectable()
export class KafkaService implements OnModuleInit {
    private readonly logger = new Logger(KafkaService.name);

    redis = new Redis({ host: 'redis', port: 6379 });

    constructor(
        @InjectModel(Transcript.name) private transcriptModel: Model<Transcript>,
    ) { }

    kafka = new Kafka({
        clientId: 'voice-service',
        brokers: ['kafka:9092'],
    });

    consumer = this.kafka.consumer({ groupId: 'voice-service-group' });

    async onModuleInit() {
        try {
            await this.consumer.connect();
            this.logger.log('Kafka Connected');

            await this.consumer.subscribe({ topic: 'ml.transcript' });
            this.logger.log('Subscribed to topic: ml.transcript');

            await this.consumer.run({
                eachMessage: async ({ topic, message }) => {
                    const data = message.value?.toString();
                    this.logger.log(`Received from Kafka: ${data}`);

                    if (!data) return;

                    const parsed = JSON.parse(data);

                    const saved = await this.transcriptModel.create(parsed);
                    this.logger.log('Transcript saved to MongoDB');

                    await this.redis.set('latest-transcript', parsed.text);
                },
            });
        } catch (err) {
            this.logger.error('Error initializing Kafka:', err);
        }
    }
}
