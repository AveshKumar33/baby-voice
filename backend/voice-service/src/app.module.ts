import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KafkaService } from './kafka.service';
import { Transcript, TranscriptSchema } from './transcript.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://mongo:27017/voice-db'),
    MongooseModule.forFeature([
      { name: Transcript.name, schema: TranscriptSchema },
    ]),
  ],
  providers: [KafkaService],
})
export class AppModule { }
