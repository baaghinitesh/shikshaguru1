import mongoose, { Schema } from 'mongoose';
import { IChat, IMessage } from '@/types';

// Message schema
const messageSchema = new Schema<IMessage>({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'location'],
    default: 'text'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  },
  fileUrl: String,
  fileName: String
}, { _id: true });

// Chat schema
const chatSchema = new Schema<IChat>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job'
  },
  messages: [messageSchema],
  lastMessage: messageSchema,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
chatSchema.index({ participants: 1 });
chatSchema.index({ jobId: 1 });
chatSchema.index({ updatedAt: -1 });
chatSchema.index({ 'messages.timestamp': -1 });
chatSchema.index({ 'messages.senderId': 1 });

// Virtual for unread message count per participant
chatSchema.virtual('unreadCount').get(function(this: IChat) {
  return this.messages.filter(msg => !msg.isRead).length;
});

// Method to get unread messages for a specific user
chatSchema.methods.getUnreadMessagesForUser = function(userId: string) {
  return this.messages.filter((msg: any) => 
    msg.senderId.toString() !== userId && !msg.isRead
  );
};

// Method to mark messages as read
chatSchema.methods.markMessagesAsRead = function(userId: string, messageIds?: string[]) {
  this.messages.forEach((message: any) => {
    if (message.senderId.toString() !== userId) {
      if (!messageIds || messageIds.includes(message._id.toString())) {
        message.isRead = true;
      }
    }
  });
  return this.save();
};

// Method to add message
chatSchema.methods.addMessage = function(message: Partial<IMessage>) {
  this.messages.push(message);
  this.lastMessage = message;
  return this.save();
};

// Static method to find chat between users
chatSchema.statics.findChatBetweenUsers = function(userId1: string, userId2: string) {
  return this.findOne({
    participants: {
      $all: [userId1, userId2],
      $size: 2
    }
  }).populate('participants', 'name avatar role')
    .populate('lastMessage.senderId', 'name avatar');
};

// Static method to find user's chats
chatSchema.statics.findUserChats = function(userId: string) {
  return this.find({
    participants: userId,
    isActive: true
  }).populate('participants', 'name avatar role lastLogin')
    .populate('jobId', 'title status')
    .populate('lastMessage.senderId', 'name avatar')
    .sort({ updatedAt: -1 });
};

export const Chat = mongoose.model<IChat>('Chat', chatSchema);