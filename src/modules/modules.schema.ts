import { Schema, Document } from 'mongoose';
import { Types } from 'mongoose';

export interface Modules {
    projectId: Types.ObjectId; // ID of the project this stage belongs to
    name: string; // Name of the kanban stage
}

export const ModulesSchema = new Schema<Modules>({
    projectId: { type: Schema.Types.ObjectId, required: true, ref: 'Project' }, // Reference to the Project collection
    name: { type: String, required: true }, // Name of the kanban stage
});