import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee } from './employee.schema';
import { UsersService } from 'src/users/user.service';

import { UsersRepo } from 'src/users/user.repo';
import { EmployeeRepo } from './employee.repo';
import axios from 'axios';
import { CompanyRepo } from 'src/company/company.repo';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel('Employee') private employeeModel: Model<Employee>,
    private userRepo: UsersRepo,
    private userService: UsersService,
    private employeeRepo: EmployeeRepo,
    private companyRepo: CompanyRepo,
  ) {}

  // Corrected createEmployee function

  async getEmployeeById(employeeId: string, companyId): Promise<Employee> {
    const employee = await this.employeeModel.findById(employeeId, companyId);
    if (!employee) {
      throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
    }
    return employee;
  }
}
