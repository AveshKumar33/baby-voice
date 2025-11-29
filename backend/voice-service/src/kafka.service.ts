import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transcript } from './transcript.schema';
import Redis from 'ioredis';

@Injectable()
export class KafkaService implements OnModuleInit {
    redis = new Redis({ host: 'redis', port: 6379 });

    constructor(
        @InjectModel(Transcript.name) private transcriptModel: Model<Transcript>,
    ) { }

    kafka = new Kafka({ brokers: ['kafka:9092'] });
    consumer = this.kafka.consumer({ groupId: 'voice-service' });

    async onModuleInit() {
        await this.consumer.connect();
        await this.consumer.subscribe({ topic: 'ml.transcript' });

        await this.consumer.run({
            eachMessage: async ({ message }) => {
                const text = message?.value?.toString();

                await this.transcriptModel.create({ text });
                await this.redis.set('latest-transcript', text ?? '');
            },
        });
    }
}
