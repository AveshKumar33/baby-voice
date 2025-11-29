import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { KafkaService } from './kafka.service';

@WebSocketGateway({
    cors: { origin: "*" }
})
export class AppGateway {
    @WebSocketServer()
    server: Server;

    constructor(private kafka: KafkaService) { }

    afterInit() {
        global['gatewaySocket'] = this.server;
    }

    // Frontend → Gateway → Kafka
    @SubscribeMessage('audio')
    handleAudio(@MessageBody() chunk: any) {
        this.kafka.sendToML(Buffer.from(chunk));
    }
}
