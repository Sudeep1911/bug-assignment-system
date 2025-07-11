import { Schema, Document } from 'mongoose';
import { Types } from 'mongoose';
export interface Company extends Document {
  name: string;
  ownerId: Types.ObjectId;
  industry: string;
  createdAt: Date;
  updatedAt: Date;
}

export const CompanySchema = new Schema({
  name: { type: String, required: true },
  ownerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  industry: { type: String, required: false },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});
