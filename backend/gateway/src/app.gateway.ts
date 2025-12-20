import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { KafkaService } from './kafka.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({
  cors: { origin: '*' }, transports: ['websocket']
})
export class AppGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(private readonly kafkaService: KafkaService, private eventEmitter: EventEmitter2) {
    // Listen for newTranscript events
    this.eventEmitter.on('newTranscript', (text: string) => {
      this.server?.emit('transcript', text);
    });
  }

  afterInit(server: Server) {
    console.log("WebSocket Gateway initialized");
  }

  handleConnection(client: any) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('healthCheck')
  healthCheck(@MessageBody() message: any) {
    console.log('connected now', message);
  }

  @SubscribeMessage('audio')
  handleAudio(@MessageBody() chunk: Uint8Array) {
    const buffer = Buffer.from(chunk);
    this.kafkaService.sendToML(buffer);
  }

  @SubscribeMessage('get-latest')
  async handleGetLatest() {
    const text = await this.kafkaService.getLatestTranscript();
    if (text) {
      this.server.emit('transcript', text);
    }
  }
}
