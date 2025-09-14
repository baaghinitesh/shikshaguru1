import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../../uploads');
const avatarDir = path.join(uploadDir, 'avatars');
const documentDir = path.join(uploadDir, 'documents');
const chatDir = path.join(uploadDir, 'chat');

[uploadDir, avatarDir, documentDir, chatDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    let uploadPath = uploadDir;
    
    // Determine upload path based on fieldname or route
    if (file.fieldname === 'avatar' || req.url.includes('avatar')) {
      uploadPath = avatarDir;
    } else if (file.fieldname === 'document' || req.url.includes('document')) {
      uploadPath = documentDir;
    } else if (req.url.includes('chat')) {
      uploadPath = chatDir;
    }
    
    cb(null, uploadPath);
  },
  filename: (req: Request, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, name);
  }
});

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Define allowed file types
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocumentTypes = /pdf|doc|docx|txt/;
  const allowedChatTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt|mp3|mp4|avi/;
  
  const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedImageTypes.test(file.mimetype);
  
  // Check file type based on context
  if (file.fieldname === 'avatar' || req.url.includes('avatar')) {
    // Only images for avatars
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      return cb(new Error('Only image files are allowed for avatars'));
    }
  } else if (file.fieldname === 'document' || req.url.includes('document')) {
    // Documents and images for documents
    const docExtname = allowedDocumentTypes.test(path.extname(file.originalname).toLowerCase());
    const docMimetype = allowedDocumentTypes.test(file.mimetype) || mimetype;
    
    if (docMimetype && (docExtname || extname)) {
      return cb(null, true);
    } else {
      return cb(new Error('Only document and image files are allowed'));
    }
  } else if (req.url.includes('chat')) {
    // More permissive for chat files
    const chatExtname = allowedChatTypes.test(path.extname(file.originalname).toLowerCase());
    const chatMimetype = allowedChatTypes.test(file.mimetype) || file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/');
    
    if (chatMimetype && chatExtname) {
      return cb(null, true);
    } else {
      return cb(new Error('File type not allowed for chat'));
    }
  } else {
    // Default: allow images
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      return cb(new Error('Only image files are allowed'));
    }
  }
};

// Multer configuration
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    files: 5 // Maximum 5 files at once
  },
  fileFilter: fileFilter
});

// Helper function to delete uploaded file
export const deleteUploadedFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

// Helper function to get file URL
export const getFileUrl = (filename: string, type: 'avatar' | 'document' | 'chat' = 'avatar'): string => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${type}s/${filename}`;
};

// Middleware to handle upload errors
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed.'
      });
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }
  
  if (error.message.includes('Only') || error.message.includes('File type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};