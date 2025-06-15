# WebSocket Chat Implementation

This document describes the WebSocket implementation for the chat functionality in the BB-Gram application.

## Overview

The chat system uses Socket.IO to enable real-time communication between users. The implementation includes:

- Authentication using Supabase tokens
- Real-time message delivery
- Direct message delivery
- Message status tracking

## Connection

To connect to the WebSocket server, the client needs to provide an authentication token:

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-supabase-jwt-token'
  }
});

// Listen for successful connection
socket.on('connection_success', (data) => {
  console.log('Connected with user ID:', data.userId);
});

// Listen for errors
socket.on('error', (error) => {
  console.error('Socket error:', error.message);
});
```

## Events

### Client to Server

1. **send_message**

   Send a message to another user.

   ```javascript
   socket.emit('send_message', {
     username: 'recipient_username',
     text: 'Hello, how are you?'
   }, (response) => {
     if (response.success) {
       console.log('Message sent successfully');
     } else {
       console.error('Failed to send message:', response.error);
     }
   });
   ```

2. **join_chat**

   Join a chat with a specific user.

   ```javascript
   socket.emit('join_chat', {
     username: 'other_username'
   }, (response) => {
     if (response.success) {
       console.log('Joined chat with ID:', response.chatId);
     } else {
       console.error('Failed to join chat:', response.error);
     }
   });
   ```

3. **mark_as_read**

   Mark messages in a chat as read.

   ```javascript
   socket.emit('mark_as_read', {
     chatId: 'chat_id_here'
   }, (response) => {
     if (response.success) {
       console.log('Messages marked as read');
     } else {
       console.error('Failed to mark messages as read:', response.error);
     }
   });
   ```

### Server to Client

1. **connection_success**

   Emitted when a client successfully connects and authenticates.

   ```javascript
   socket.on('connection_success', (data) => {
     console.log('Connected with user ID:', data.userId);
   });
   ```

2. **test_message**

   Emitted immediately after successful connection to verify the client is properly receiving events.

   ```javascript
   socket.on('test_message', (data) => {
     console.log('Test message received:', data);
     // Optionally acknowledge receipt
     return { received: true, timestamp: new Date().toISOString() };
   });
   ```

3. **ping**

   Emitted to verify the socket connection is still active and responsive.

   ```javascript
   socket.on('ping', (data) => {
     console.log('Ping received:', data);
     // Always acknowledge pings to help the server verify connection
     return { pong: true, timestamp: new Date().toISOString() };
   });
   ```

4. **message_sent**

   Confirmation that a message was sent successfully.

   ```javascript
   socket.on('message_sent', (messageData) => {
     console.log('Message sent:', messageData);
   });
   ```

5. **new_message**

   Emitted when a new message is received.

   ```javascript
   socket.on('new_message', (messageData) => {
     console.log('New message received:', messageData);
     // Update UI with new message

     // IMPORTANT: Always acknowledge receipt of messages
     // This helps the server confirm delivery
     return { received: true, messageId: messageData.id };
   });
   ```

6. **error**

   Emitted when an error occurs.

   ```javascript
   socket.on('error', (error) => {
     console.error('Socket error:', error.message);
   });
   ```

## Authentication

The WebSocket connection is authenticated using Supabase JWT tokens. The token should be provided in the connection options:

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-supabase-jwt-token'
  }
});
```

The server will verify the token with Supabase and establish the connection if the token is valid. If the token is invalid or missing, the connection will be rejected.

## Error Handling

The server emits 'error' events when something goes wrong. Clients should listen for these events to handle errors gracefully:

```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error.message);
  // Handle error (e.g., show notification to user)
});
```

## Message Delivery

The chat system uses a direct message delivery mechanism rather than Socket.IO rooms. When a user connects, their socket is stored in a map with their user ID as the key. When a message is sent to a recipient, the system:

1. Looks up the recipient's socket in the connected users map
2. If the recipient is connected, the message is emitted directly to their socket
3. If the recipient is not connected, the message is stored in the database and will be available when they connect

This approach ensures reliable message delivery and avoids issues with Socket.IO rooms.

## Disconnection

The server handles disconnections automatically. When a client disconnects, the server cleans up resources and removes the user from the connected users list.

## Troubleshooting

If you're experiencing issues with WebSocket connections or message delivery, try the following steps:

### Messages Not Being Received

1. **Verify Connection Status**: Make sure both the sender and recipient are properly connected. Check the logs for "Client connected" messages.

2. **Check Event Listeners**: Ensure that your client has registered listeners for all relevant events, especially `new_message`.

3. **Implement Acknowledgements**: Always implement acknowledgement callbacks for events to confirm receipt:

   ```javascript
   socket.on('new_message', (data) => {
     console.log('Message received:', data);
     // Return an acknowledgement
     return { received: true };
   });
   ```

4. **Reconnection Logic**: Implement reconnection logic in your client to handle temporary disconnections:

   ```javascript
   const socket = io('http://localhost:3000', {
     auth: { token: 'your-token' },
     reconnection: true,
     reconnectionAttempts: 5,
     reconnectionDelay: 1000
   });
   ```

5. **Debug Mode**: Enable Socket.IO debug mode to see detailed logs:

   ```javascript
   localStorage.debug = 'socket.io-client:*';
   ```

### Connection Issues

1. **Token Validation**: Ensure your authentication token is valid and not expired.

2. **CORS Issues**: If you're getting CORS errors, make sure your client's origin is allowed by the server.

3. **Network Problems**: Check for network connectivity issues or firewalls blocking WebSocket connections.

4. **Server Logs**: Examine the server logs for any errors or warnings related to your connection.

If you continue to experience issues, please contact the development team with detailed information about the problem, including any error messages and the steps you've taken to troubleshoot.
