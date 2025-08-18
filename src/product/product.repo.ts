import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from './product.schema';

@Injectable()
export class ProductRepo {
  constructor(@InjectModel('Project') private projectModel: Model<Project>) {}
  public async getEmployeesByProjectId(projectId: string): Promise<any> {
    return this.projectModel.findOne({ _id: projectId }, 'employees').populate('employees');
  }
}