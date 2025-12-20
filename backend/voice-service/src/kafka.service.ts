import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transcript } from './transcript.schema';
import Redis from 'ioredis';

@Injectable()
export class KafkaService implements OnModuleInit {
    private readonly logger = new Logger(KafkaService.name);

    private kafka = new Kafka({
        clientId: 'voice-service',
        brokers: ['kafka:9092'],
    });

    private consumer = this.kafka.consumer({ groupId: 'voice-service-group' });
    private producer = this.kafka.producer();
    private redis = new Redis({ host: 'redis', port: 6379 });

    constructor(
        @InjectModel(Transcript.name)
        private readonly transcriptModel: Model<Transcript>,
    ) { }

    async onModuleInit() {
        await this.consumer.connect();
        await this.producer.connect();
        this.logger.log('Kafka Connected (consumer + producer)');
        await this.consumer.subscribe({ topic: 'ml.transcript' });
        await this.consumer.run({
            eachMessage: async ({ message }) => {
                if (!message.value) return;
                const parsed = JSON.parse(message.value.toString());
                /** Save to MongoDB */
                const data = await this.transcriptModel.create({
                    text: parsed.text,
                    confidence: parsed.confidence,
                    model_name: parsed.model_name,
                    audio_duration: parsed.audio_duration,
                    language: parsed.language,
                });
                console.log('data:::', data);
                /** Cache latest transcript in Redis */
                await this.redis.set('latest-transcript', parsed.text);
                /** Produce to a new topic for the gateway */
                await this.producer.send({
                    topic: 'gateway.transcript',
                    messages: [{ value: JSON.stringify(parsed) }],
                });

                this.logger.log('Transcript saved, cached & sent to gateway topic');
            },
        });
    }
}
