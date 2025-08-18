import { Schema, Document } from 'mongoose';
import { Types } from 'mongoose';
export interface Company extends Document {
  name: string;
  ownerId: Types.ObjectId;
  industry: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export const CompanySchema = new Schema({
  name: { type: String, required: false,unique: false },
  ownerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  industry: { type: String, required: false },
  description: { type: String, required: false },
  string: { type: String, required: false },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});

CompanySchema.index({ name: 1, ownerId: 1 }, { unique: true });