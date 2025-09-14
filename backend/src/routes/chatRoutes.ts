import express from 'express';
import { protect } from '@/middleware/authMiddleware';
import { asHandler } from '@/types/express';
import {
  createChat,
  getChats,
  getChatById,
  sendMessage,
  markMessagesAsRead,
  getChatMessages,
  generateWhatsAppLink,
  uploadChatFile,
  deleteChatMessage,
  searchChatMessages
} from '@/controllers/chatController';
import { upload } from '@/middleware/uploadMiddleware';

const router = express.Router();

// Protected routes - all require authentication
router.use(asHandler(protect));

// Chat management
router.post('/', asHandler(createChat));
router.get('/', asHandler(getChats));
router.get('/:chatId', asHandler(getChatById));

// Message operations
router.post('/:chatId/messages', asHandler(sendMessage));
router.get('/:chatId/messages', asHandler(getChatMessages));
router.put('/:chatId/messages/read', asHandler(markMessagesAsRead));
router.delete('/:chatId/messages/:messageId', asHandler(deleteChatMessage));
router.get('/:chatId/messages/search', asHandler(searchChatMessages));

// File sharing
router.post('/:chatId/upload', upload.single('file'), asHandler(uploadChatFile));

// WhatsApp integration
router.post('/:chatId/whatsapp', asHandler(generateWhatsAppLink));

export default router;