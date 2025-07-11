import { Schema, Document } from 'mongoose';
import { Types } from 'mongoose';
export interface Employee extends Document {
  userId: Types.ObjectId;
  companyId: Types.ObjectId;
  name: string;
  role: 'developer' | 'tester';
  designation: string;
  email: string;
  proficiency: number;
  module: string;
  createdAt: Date;
  updatedAt: Date;
}

export const EmployeeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  companyId: { type: Schema.Types.ObjectId, required: true, ref: 'Company' },
  name: { type: String, required: true },
  role: { type: String, required: true },
  designation: { type: String, required: true },
  email: { type: String, required: true },
  proficiency: { type: [String], required: false },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});
