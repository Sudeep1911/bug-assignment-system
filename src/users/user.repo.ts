import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';
import { Types } from 'mongoose';

@Injectable()
export class UsersRepo {
  constructor(@InjectModel('User') private userModel: Model<User>) {}
  public async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email });
  }
  public async findById(id: string): Promise<User> {
    return this.userModel.findOne({ _id: id });
  }
  public async createUser(
    email: string,
    password: string,
    role: 'admin' | 'developer' | 'tester',
    name: string,
  ): Promise<User> {
    const newUser = new this.userModel({ email, password, role, name });
    return newUser.save();
  }

  public async findByEmailAndCompany(
    email: string,
    companyId: string,
  ): Promise<User> {
    return this.userModel.findOne({
      email: email,
      'details.companyId': companyId,
    });
  }

  public async createUserWithCompanyId(
    email: string,
    password: string,
    role: 'admin' | 'developer' | 'tester',
    name: string,
    companyId: string,
  ): Promise<User> {
    const newUser = new this.userModel({
      email,
      password,
      role,
      name,
      'details.companyId': companyId,
    });
    return newUser.save();
  }

  public async updateUser(userId: string, companyId: string) {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { 'details.companyId': new Types.ObjectId(companyId) } },
        {
          new: true,
          runValidators: true,
        },
      )
      .lean();
  }

  public async findUsersByCompanyId(companyId: string): Promise<User[]> {
    return this.userModel
      .find({ 'details.companyId': new Types.ObjectId(companyId) })
      .lean();
  }
  public async updateUserData(userId: string, data: any) {
    return this.userModel.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    });
  }
  public async deleteUserCompany(userId: string, companyId: string) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $unset: { 'details.companyId': '' } },
      {
        new: true,
        runValidators: true,
      },
    );
  }
}
