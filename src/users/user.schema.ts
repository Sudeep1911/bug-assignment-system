import { Schema, Document } from 'mongoose';
import { Types } from 'mongoose';
export interface User extends Document {
  email: string;
  password: string;
  name?: string;
  role?: 'developer' | 'tester' | 'admin';
  details: {
    companyId?: Types.ObjectId;
    designation?: string;
    proficiency?: string[];
    module?: string;
  };
}

export const UserSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: false },
  role: {
    type: String,
    enum: ['developer', 'tester', 'admin'],
    required: true,
  },
  details: {
    type: new Schema(
      {
        companyId: {
          type: Schema.Types.ObjectId,
          required: false,
          ref: 'Company',
        },
        designation: { type: String, required: false },
        proficiency: { type: [String], required: false },
        module: { type: String, required: false },
      },
      { _id: false },
    ),
    default: undefined,
    required: false,
  },
});
