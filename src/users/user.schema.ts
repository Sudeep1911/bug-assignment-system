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
    modules?: {
      module: Types.ObjectId;          // References Module collection
      proficiency: number;
    }[];
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
        modules: [
          {
            module: { type: Schema.Types.ObjectId, ref: 'Modules', required: true },
            proficiency: { type: Number, required: true },
          },
        ],
      },
      { _id: false },
    ),
    default: undefined,
    required: false,
  },
});
