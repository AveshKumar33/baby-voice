import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { KafkaService } from './kafka.service';

@WebSocketGateway({ cors: { origin: "*" } })
export class AppGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly kafka: KafkaService) { }

  afterInit() {
    global['gatewaySocket'] = this.server;
  }

  // React -> Gateway -> Kafka
  @SubscribeMessage('audio')
  handleAudio(@MessageBody() chunk: any) {
    this.kafka.sendToML(Buffer.from(chunk));
  }
}
