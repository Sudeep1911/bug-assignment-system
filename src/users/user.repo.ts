import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';

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
}
