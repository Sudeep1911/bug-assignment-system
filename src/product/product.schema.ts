import { Schema, Document } from 'mongoose';
import { Types } from 'mongoose';

export interface Project extends Document {
  companyId: Types.ObjectId; // Company the project belongs to
  name: string; // Project name
  description: string; // Description of the project
  startDate: Date; // Project start date
  endDate?: Date; // Project end date (optional)
  kanbanStages: string[]; // Custom Kanban stages for this project
  employees: Types.ObjectId[]; // References to Employee collection (array of employee IDs)
  createdAt: Date; // When the project was created
  updatedAt: Date; // Last update time
}

export const ProjectSchema = new Schema({
  companyId: { type: Schema.Types.ObjectId, required: true, ref: 'Company' }, // Reference to the Company collection
  name: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: null },
  kanbanStages: { type: [String], default: [] }, // Default stages for Kanban
  employees: { type: [Schema.Types.ObjectId], ref: 'User', default: [] }, // References to Employee collection
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
