import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Company } from './company.schema';
import { Model } from 'mongoose';

@Injectable()
export class CompanyRepo {
  constructor(@InjectModel('Company') private companyModel: Model<Company>) {}
  public async createCompany(
    name: string,
    ownerId: string,
    industry: string,
    description?: string,
  ) {
    const company = new this.companyModel({
      name,
      ownerId,
      industry,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return company.save();
  }
  public async findCompanyByName(name: string, ownerId: string) {
    return this.companyModel.findOne({ name, ownerId });
  }
  public async findCompanyById(id: string) {
    return this.companyModel.findById(id);
  }
}
