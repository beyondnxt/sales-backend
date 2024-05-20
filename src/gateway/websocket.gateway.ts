/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { UserService } from 'src/user/user.service';

@WebSocketGateway({ cors: '*:*' })
export class WebsocketGateway {

  constructor(
    private readonly userService: UserService
  ) {
  }

  @WebSocketServer()
  server: Server;

  async handleConnection(client: any, ..._args: any[]) {
    try {
      const authToken = client.handshake.headers['authorization'];
      // console.log('authToken', authToken);

      if (!authToken) {
        console.log('Missing authToken');
        client.disconnect(true);
        return;
      }
   
      const decodedToken = jwt.decode(authToken);
      if (!decodedToken || typeof decodedToken !== 'object') {
        console.log('Invalid authToken');
        client.disconnect(true);
        return;
      }

      const userId = decodedToken.userId;
      const userExists = await this.userService.doesUserExist(userId);
      // console.log('userExists', userExists);

      if (!userExists) {
        console.log('User does not exist');
        client.disconnect(true);
        return;
      } else {
        console.log('User exists');
      }
    } catch (error) {
      console.error('Error handling WebSocket connection:', error);
      client.disconnect(true);
    }
  }

  handleDisconnect(socket: Socket) {
    this.disconnect(socket);
  }

  @SubscribeMessage('admin_notification')
  sendNotificationToAdmin(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.server.emit('admin_notification', message);
    } catch (error) {
      this.disconnect(client);
      throw error;
    }
  }

  @SubscribeMessage('get_task_data')
  getTaskData(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.server.emit('get_task_data', message);
    } catch (error) {
      this.disconnect(client);
      throw error;
    }
  }

  async disconnect(socket: Socket) {
    this.server.emit('Error', new BadRequestException());
    socket.disconnect();
  }
}
