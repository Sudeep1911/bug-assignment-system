import { Schema, model, Document } from 'mongoose';
import { Types } from 'mongoose';

interface ModulePrediction {
  label: string; // e.g., UI, Authentication, Database, etc.
  confidence: number;
}

interface PriorityPrediction {
  label: 'High' | 'Medium' | 'Low';
  confidence: number;
}

export interface Task extends Document {
  taskId: string;
  projectId: string;
  type: 'Bug' | 'Feature' | 'Task';
  title: string;
  description: string;
  raisedBy: Types.ObjectId;
  monitoredBy?: Types.ObjectId;
  timestamp: Date;
  modulePrediction?: ModulePrediction;
  priorityPrediction?: PriorityPrediction;
  assignedTo?: Types.ObjectId;
  status?: string; // Dynamic Kanban column name
  tags?: string[];
  dueDate?: Date;
  attachments?: string[];
}

const TaskSchema = new Schema<Task>({
  taskId: { type: String, required: true, unique: true },
  projectId: { type: String, required: true },
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

  modulePrediction: {
    label: { type: String },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
  },

  priorityPrediction: {
    label: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
  },

  assignedTo: { type: Schema.Types.ObjectId, ref: 'Employee' },
  status: { type: String, default: 'Backlog' },
  tags: [{ type: String }],
  dueDate: { type: Date },
  attachments: [{ type: String }],
});

export const TaskModel = model<Task>('Task', TaskSchema);
