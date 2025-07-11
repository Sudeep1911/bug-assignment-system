import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Employee } from './employee.schema';
import { Model } from 'mongoose';

@Injectable()
export class EmployeeRepo {
  constructor(
    @InjectModel('Employee') private employeeModel: Model<Employee>,
  ) {}
  public async createEmployee(
    userId: string,
    companyId: string,
    name: string,
    role: 'developer' | 'tester',
    designation: string,
    email: string,
    proficiency?: string[],
  ) {
    const newEmployee = new this.employeeModel({
      userId,
      companyId,
      name,
      role,
      designation,
      email,
      proficiency,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return newEmployee.save();
  }
  async findEmployeeByEmail(email: string, companyId: string) {
    return this.employeeModel.findOne({ email, companyId });
  }
}
