import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KafkaService } from './kafka.service';
import { Transcript, TranscriptSchema } from './transcript.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://katiyaravesh333:root@cluster0.3wojr.mongodb.net/voice-reader?retryWrites=true&w=majority'),
    MongooseModule.forFeature([
      { name: Transcript.name, schema: TranscriptSchema },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, KafkaService],
})
export class AppModule { }
