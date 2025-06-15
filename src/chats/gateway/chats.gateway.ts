import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ChatsService } from '../chats.service';
import { SupabaseService } from '../../common/supabase/supabase.service';

interface MessagePayload {
  username: string;
  text: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger('ChatsGateway');
  private connectedUsers = new Map<string, Socket>();

  constructor(
    private readonly chatsService: ChatsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async handleConnection(client: Socket) {
    try {
        const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
        this.logger.log(`Client connected: ${client.id}, Token: ${token}`);
      if (!token) {
        this.logger.error('No token provided');
        client.disconnect();
        return;
      }

      // Verify token using Supabase
      const { data, error } = await this.supabaseService
        .getClient()
        .auth.getUser(token);

      if (error) {
        this.logger.error(`Authentication error: ${error.message}`);
        client.disconnect();
        return;
      }

      const userId = data.user.id;
      client.data.user = data.user;

      // Store the connection with the user ID
      this.connectedUsers.set(userId, client);

      this.logger.log(`Client connected: ${userId}, Socket ID: ${client.id}`);

      // We don't need to join a room with the user's ID
      // Instead, we'll use the connectedUsers map to find the socket

      // Emit connection success event
      client.emit('connection_success', { userId });

      // Send a test message to verify the connection is working
      client.emit('test_message', { 
        message: 'This is a test message to verify your connection is working correctly',
        timestamp: new Date().toISOString()
      });

      // Socket.IO doesn't expose listeners directly, so we can't log them
      this.logger.log(`Socket ${client.id} is ready to receive events`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    try {
      const userId = client.data?.user?.id;

      if (userId) {
        this.connectedUsers.delete(userId);
        this.logger.log(`Client disconnected: ${userId}`);
      }
    } catch (error) {
      this.logger.error(`Disconnection error: ${error.message}`);
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MessagePayload,
  ) {
    try {
      const sender = client.data.user;

      if (!sender) {
        throw new UnauthorizedException('User not authenticated');
      }

      const { username, text } = payload;

      if (!username || !text) {
        throw new Error('Missing required message parameters');
      }


      // Save message using the existing chat service
      const chat = await this.chatsService.sendMessage(username, text, sender.id);

      // Get the recipient's user ID
      const recipientId = chat.user1_id === sender.id ? chat.user2_id : chat.user1_id;
      this.logger.log(`Direct message to recipient ID: ${recipientId}`);
      this.logger.log(`Is recipient connected? ${this.connectedUsers.has(recipientId)}`);
      // Create a message object to send
      const messageData = {
        text,
        senderId: sender.id,
        chatId: chat.id,
        createdAt: new Date().toISOString(),
        isRead: false,
      };

      // Emit to the sender
      client.emit('message_sent', messageData);

      // Emit to the recipient if they are connected
      if (this.connectedUsers.has(recipientId)) {
        const recipientSocket = this.connectedUsers.get(recipientId);
        if (!recipientSocket) {
          throw new Error(`Recipient socket not found for user ID: ${recipientId}`);
        }

        // Verify the socket is still connected
        if (!recipientSocket.connected) {
          this.logger.warn(`Recipient socket exists but is disconnected for user ID: ${recipientId}`);
          // Remove the disconnected socket from the map
          this.connectedUsers.delete(recipientId);
          return { success: true, message: 'Message saved but recipient is disconnected' };
        }

        this.logger.log(`Recipient socket ID: ${recipientSocket.id}`);

        // Add more detailed logging
        this.logger.log(`Emitting 'new_message' event to recipient with data:`, {
          ...messageData,
          senderUsername: sender.email
        });

        // Emit the message with a callback to confirm delivery
        try {
          recipientSocket.emit('new_message', {
            ...messageData,
            senderUsername: sender.email, // Using email as fallback if username is not available
          }, (acknowledgement) => {
            this.logger.log(`Message delivery acknowledgement:`, acknowledgement);
          });

          this.logger.log('Message emitted directly to recipient socket');

          // Emit a separate ping event to verify the socket is responsive
          recipientSocket.emit('ping', { timestamp: new Date().toISOString() }, (pingAck) => {
            this.logger.log(`Ping acknowledgement from recipient:`, pingAck);
          });
        } catch (emitError) {
          this.logger.error(`Error emitting message to recipient: ${emitError.message}`);
          // If there's an error emitting, the socket might be in a bad state
          this.connectedUsers.delete(recipientId);
          return { success: false, error: `Failed to deliver message: ${emitError.message}` };
        }
      }
      // Log detailed information for debugging
      this.logger.debug(`Message details:
        Sender ID: ${sender.id}
        Chat user1_id: ${chat.user1_id}
        Chat user2_id: ${chat.user2_id}
        Recipient ID: ${recipientId}
        Connected users: ${Array.from(this.connectedUsers.keys())}
        Is recipient connected: ${this.connectedUsers.has(recipientId)}
      `);

      return { success: true, message: 'Message sent successfully' };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('join_chat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { username: string },
  ) {
    try {
      const user = client.data.user;

      if (!user) {
        throw new UnauthorizedException('User not authenticated');
      }

      const { username } = payload;

      if (!username) {
        throw new Error('Username is required');
      }

      // Get or create chat with the specified user
      const chat = await this.chatsService.getChatWithUser(user.id, username);

      if (!chat) {
        throw new Error(`Chat with user ${username} not found`);
      }

      // Join a room specific to this chat
      const chatRoomId = `chat_${chat.id}`;
      client.join(chatRoomId);

      return { success: true, chatId: chat.id };
    } catch (error) {
      this.logger.error(`Error joining chat: ${error.message}`);
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatId: string },
  ) {
    // This would be implemented in the chat service
    // For now, just acknowledge the event
    return { success: true };
  }
}
