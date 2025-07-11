import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Company } from './company.schema';
import { Model } from 'mongoose';

@Injectable()
export class CompanyRepo {
  constructor(@InjectModel('Company') private companyModel: Model<Company>) {}
  public async createCompany(name: string, ownerId: string, industry: string) {
    const company = new this.companyModel({
      name,
      ownerId,
      industry,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return company.save();
  }
  public async findCompanyByName(name: string, ownerId: string) {
    return this.companyModel.findOne({ name, ownerId });
  }
}
