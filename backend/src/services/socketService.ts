import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '@/models/User';
import { Chat } from '@/models/Chat';
import { ISocketUser, ISocketMessage, ExtendedSocketIOServer } from '@/types';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

// Store active users
const activeUsers = new Map<string, ISocketUser>();

// Socket authentication middleware
const authenticateSocket = async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return next(new Error('Authentication error: Invalid user'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};

// Initialize Socket.IO with authentication and event handlers
export const initializeSocket = (io: Server) => {
  // Authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.user.name} connected with socket ID: ${socket.id}`);

    // Add user to active users
    if (socket.userId) {
      activeUsers.set(socket.userId, {
        userId: socket.userId,
        socketId: socket.id,
        isOnline: true,
        lastSeen: new Date()
      });

      // Join user to their personal room
      socket.join(socket.userId);

      // Broadcast user online status
      socket.broadcast.emit('user-online', {
        userId: socket.userId,
        isOnline: true
      });
    }

    // Handle joining chat rooms
    socket.on('join-chat', async (chatId: string) => {
      try {
        // Verify user is part of this chat
        const chat = await Chat.findById(chatId);
        if (chat && chat.participants.includes(socket.userId as any)) {
          socket.join(`chat-${chatId}`);
          console.log(`User ${socket.userId} joined chat ${chatId}`);
        } else {
          socket.emit('error', { message: 'Not authorized to join this chat' });
        }
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle leaving chat rooms
    socket.on('leave-chat', (chatId: string) => {
      socket.leave(`chat-${chatId}`);
      console.log(`User ${socket.userId} left chat ${chatId}`);
    });

    // Handle sending messages
    socket.on('send-message', async (data: ISocketMessage) => {
      try {
        const { chatId, content, type = 'text' } = data;

        // Verify user is part of this chat
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(socket.userId as any)) {
          socket.emit('error', { message: 'Not authorized to send message to this chat' });
          return;
        }

        // Create message object
        const message = {
          senderId: socket.userId,
          content,
          type,
          timestamp: new Date(),
          isRead: false
        };

        // Update chat with new message
        chat.messages.push(message as any);
        chat.lastMessage = message as any;
        await chat.save();

        // Emit message to all participants in the chat
        io.to(`chat-${chatId}`).emit('new-message', {
          chatId,
          message: {
            ...message,
            sender: {
              _id: socket.userId,
              name: socket.user.name,
              avatar: socket.user.avatar
            }
          }
        });

        // Send push notification to offline users
        const offlineParticipants = chat.participants.filter(
          (participantId: any) => participantId.toString() !== socket.userId && !activeUsers.has(participantId.toString())
        );

        if (offlineParticipants.length > 0) {
          // TODO: Implement push notification service
          console.log(`Sending push notifications to ${offlineParticipants.length} offline users`);
        }

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing-start', (chatId: string) => {
      socket.to(`chat-${chatId}`).emit('user-typing', {
        userId: socket.userId,
        userName: socket.user.name,
        chatId
      });
    });

    socket.on('typing-stop', (chatId: string) => {
      socket.to(`chat-${chatId}`).emit('user-stop-typing', {
        userId: socket.userId,
        chatId
      });
    });

    // Handle message read status
    socket.on('mark-messages-read', async (data: { chatId: string, messageIds: string[] }) => {
      try {
        const { chatId, messageIds } = data;
        
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(socket.userId as any)) {
          return;
        }

        // Mark messages as read
        chat.messages.forEach((message: any) => {
          if (messageIds.includes(message._id.toString()) && message.senderId.toString() !== socket.userId) {
            message.isRead = true;
          }
        });

        await chat.save();

        // Notify sender about read status
        socket.to(`chat-${chatId}`).emit('messages-read', {
          chatId,
          messageIds,
          readBy: socket.userId
        });

      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle video call requests
    socket.on('video-call-request', (data: { chatId: string, receiverId: string }) => {
      const { chatId, receiverId } = data;
      
      socket.to(receiverId).emit('incoming-video-call', {
        callerId: socket.userId,
        callerName: socket.user.name,
        callerAvatar: socket.user.avatar,
        chatId
      });
    });

    // Handle video call responses
    socket.on('video-call-response', (data: { callerId: string, accepted: boolean, chatId: string }) => {
      const { callerId, accepted, chatId } = data;
      
      socket.to(callerId).emit('video-call-response', {
        accepted,
        receiverId: socket.userId,
        receiverName: socket.user.name,
        chatId
      });
    });

    // Handle WebRTC signaling
    socket.on('webrtc-offer', (data: { receiverId: string, offer: any, chatId: string }) => {
      socket.to(data.receiverId).emit('webrtc-offer', {
        offer: data.offer,
        senderId: socket.userId,
        chatId: data.chatId
      });
    });

    socket.on('webrtc-answer', (data: { senderId: string, answer: any, chatId: string }) => {
      socket.to(data.senderId).emit('webrtc-answer', {
        answer: data.answer,
        receiverId: socket.userId,
        chatId: data.chatId
      });
    });

    socket.on('webrtc-ice-candidate', (data: { receiverId: string, candidate: any, chatId: string }) => {
      socket.to(data.receiverId).emit('webrtc-ice-candidate', {
        candidate: data.candidate,
        senderId: socket.userId,
        chatId: data.chatId
      });
    });

    // Handle location sharing
    socket.on('share-location', async (data: { chatId: string, location: { latitude: number, longitude: number, address?: string } }) => {
      try {
        const { chatId, location } = data;

        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(socket.userId as any)) {
          socket.emit('error', { message: 'Not authorized to share location in this chat' });
          return;
        }

        const message = {
          senderId: socket.userId,
          content: JSON.stringify(location),
          type: 'location',
          timestamp: new Date(),
          isRead: false
        };

        chat.messages.push(message as any);
        chat.lastMessage = message as any;
        await chat.save();

        io.to(`chat-${chatId}`).emit('new-message', {
          chatId,
          message: {
            ...message,
            sender: {
              _id: socket.userId,
              name: socket.user.name,
              avatar: socket.user.avatar
            }
          }
        });

      } catch (error) {
        console.error('Error sharing location:', error);
        socket.emit('error', { message: 'Failed to share location' });
      }
    });

    // Handle job-related notifications
    socket.on('job-application', (data: { jobOwnerId: string, jobTitle: string, applicantName: string }) => {
      socket.to(data.jobOwnerId).emit('notification', {
        type: 'job-application',
        title: 'New Job Application',
        message: `${data.applicantName} applied for your job: ${data.jobTitle}`,
        data: data
      });
    });

    socket.on('application-status-update', (data: { applicantId: string, jobTitle: string, status: string }) => {
      socket.to(data.applicantId).emit('notification', {
        type: 'application-update',
        title: 'Application Status Update',
        message: `Your application for "${data.jobTitle}" has been ${data.status}`,
        data: data
      });
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`User ${socket.user?.name} disconnected: ${reason}`);
      
      if (socket.userId) {
        // Update user status
        const user = activeUsers.get(socket.userId);
        if (user) {
          user.isOnline = false;
          user.lastSeen = new Date();
        }

        // Broadcast user offline status after a delay (in case of reconnection)
        setTimeout(() => {
          const currentUser = activeUsers.get(socket.userId!);
          if (currentUser && !currentUser.isOnline) {
            activeUsers.delete(socket.userId!);
            socket.broadcast.emit('user-offline', {
              userId: socket.userId,
              isOnline: false,
              lastSeen: currentUser.lastSeen
            });
          }
        }, 30000); // 30 seconds delay
      }
    });

  });

  // Cast io to extended interface and add helper methods
  const extendedIo = io as ExtendedSocketIOServer;

  // Helper function to get online users
  extendedIo.getActiveUsers = () => {
    return Array.from(activeUsers.values());
  };

  // Helper function to check if user is online
  extendedIo.isUserOnline = (userId: string) => {
    const user = activeUsers.get(userId);
    return user ? user.isOnline : false;
  };

  // Helper function to send notification to specific user
  extendedIo.sendNotification = (userId: string, notification: any) => {
    extendedIo.to(userId).emit('notification', notification);
  };

  console.log('Socket.IO service initialized successfully');
};