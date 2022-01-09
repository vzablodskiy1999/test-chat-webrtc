import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  activeSockets: string[] = [];
  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('call-user')
  handleCallUser(
    client: Socket,
    payload: { offer: Record<string, unknown>; to: string },
  ): void {
    this.server.to(payload.to).emit('call-made', {
      offer: payload.offer,
      socket: client.id,
    });
  }

  @SubscribeMessage('make-answer')
  handleMakeAnswer(
    client: Socket,
    payload: { answer: Record<string, unknown>; to: string },
  ): void {
    this.server.to(payload.to).emit('answer-made', {
      answer: payload.answer,
      socket: client.id,
    });
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.activeSockets = this.activeSockets.filter(
      (existingSocket) => existingSocket !== client.id,
    );
    client.broadcast.emit('remove-user', {
      socketId: client.id,
    });

    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket) {
    const existingSocket = this.activeSockets.find(
      (existingSocket) => existingSocket === client.id,
    );

    if (!existingSocket) {
      this.activeSockets.push(client.id);

      client.emit('update-user-list', {
        users: this.activeSockets.filter(
          (existingSocket) => existingSocket !== client.id,
        ),
      });

      client.broadcast.emit('update-user-list', {
        users: [client.id],
      });
    }

    this.logger.log(`Client connected: ${client.id}`);
  }
}
