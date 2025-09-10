import { Schema, model, Document, Types } from 'mongoose';

export interface Attachment {
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: Date;
}

const AttachmentSchema = new Schema<Attachment>({
  filePath: { type: String, required: true },
  fileName: { type: String, required: true },
  mimeType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export interface Task extends Document {
  taskId?: string;
  projectId: string;
  companyId?: Types.ObjectId; // Optional field for company association
  type: 'Bug' | 'Feature' | 'Task';
  title: string;
  description: string;
  raisedBy: Types.ObjectId;
  monitoredBy?: Types.ObjectId;
  timestamp: Date;
  modules: Types.ObjectId; // Reference to the Modules schema's _id
  priority: 'High' | 'Medium' | 'Low';
  assignedTo?: Types.ObjectId;
  status?: Types.ObjectId; // Reference to the KanbanStage schema's _id
  tags?: string[];
  dueDate?: Date;
  attachments?: Attachment[];
}

export const TaskSchema = new Schema<Task>({
  taskId: {
    type: String,
    unique: true,
    default: () => new Types.ObjectId().toString(),
  },
  projectId: { type: String, required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' }, // Optional reference to Company schema
  type: {
    type: String,
    enum: ['Bug', 'Feature', 'Task'],
    default: 'Task',
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  raisedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  monitoredBy: { type: Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },

  modules: { type: Schema.Types.ObjectId, ref: 'Modules' },

  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
  },

  assignedTo: { type: Schema.Types.ObjectId, ref: 'Employee' },
  status: { type: Schema.Types.ObjectId, ref: 'KanbanStage' }, // Reference to the KanbanStage collection
  tags: [{ type: String }],
  dueDate: { type: Date },
  attachments: [AttachmentSchema],
});

export const TaskModel = model<Task>('Task', TaskSchema);
