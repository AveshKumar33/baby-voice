import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { KafkaService } from './kafka.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class AppGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly kafkaService: KafkaService) { }

  /** health Check from frontend */
  @SubscribeMessage('healthCheck')
  healthCheck(@MessageBody() message: any) {
    console.log('connected now', message,);
  }

  /** Audio stream from frontend */
  @SubscribeMessage('audio')
  handleAudio(@MessageBody() chunk: ArrayBuffer) {
    this.kafkaService.sendToML(Buffer.from(chunk));
  }

  /** Frontend requests latest transcript */
  @SubscribeMessage('get-latest')
  async handleGetLatest() {
    const text = await this.kafkaService.getLatestTranscript();
    if (text) {
      this.server.emit('transcript', text);
    }
  }
}
