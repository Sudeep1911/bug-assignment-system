import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Modules } from './modules.schema';

@Injectable()
export class ModulesRepo {
  constructor(@InjectModel('Modules') private companyModel: Model<Modules>) {}

  async getModuleByName(name: string, projectId: string) {
    return this.companyModel.findOne({ name, projectId });
  }

  async getAllModulesByProjectId(projectId: string) {
    return this.companyModel.find({ projectId });
  }
}