import { Schema, model, Document, Types } from 'mongoose';

// Define the structure for a chat attachment
export interface ChatAttachment {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
}

// Define the structure for a single chat message
export interface ChatMessage extends Document {
  chatId: string;
  userId: string;
  text: string;
  createdAt: number;
  attachments?: ChatAttachment[];
}

// Mongoose schema for chat attachments
const ChatAttachmentSchema = new Schema<ChatAttachment>(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
    url: { type: String, required: true },
    name: { type: String, required: true },
  },
  { _id: false },
);

// Mongoose schema for chat messages
export const ChatMessageSchema = new Schema<ChatMessage>({
  chatId: { type: String, required: true },
  userId: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Number, default: Date.now },
  attachments: { type: [ChatAttachmentSchema], required: false },
});

export const ChatMessageModel = model<ChatMessage>(
  'ChatMessage',
  ChatMessageSchema,
);
