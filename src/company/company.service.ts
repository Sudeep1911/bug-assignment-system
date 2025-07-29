import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from './company.schema';
import { UsersService } from 'src/users/user.service';
import { UsersRepo } from 'src/users/user.repo';
import { CompanyRepo } from './company.repo';
import { Types } from 'mongoose'; // or from 'bson' if you're using bson
@Injectable()
export class CompanyService {
  constructor(
    @InjectModel('Company') private companyModel: Model<Company>,
    private companyRepo: CompanyRepo,
    private userRepo: UsersRepo,
  ) {}

  async createCompany(
    name: string,
    ownerId: string,
    industry: string,
    description: string,
  ) {
    const user = await this.userRepo.findById(ownerId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const existingCompany = await this.companyRepo.findCompanyByName(
      name,
      ownerId,
    );
    if (existingCompany) {
      throw new HttpException('Company already exists', HttpStatus.BAD_REQUEST);
    }
    const company = await this.companyRepo.createCompany(
      name,
      ownerId,
      industry,
      description,
    );

    const update = await this.userRepo.updateUser(
      ownerId,
      company._id.toString(),
    );
    console.log(update);
    return company;
  }

  async getUsersByCompanyId(companyId: string) {

    const users = await this.userRepo.findUsersByCompanyId(companyId);
    return users;
  }
}
