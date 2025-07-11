import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee } from './employee.schema';
import { UsersService } from 'src/users/user.service';
import { generateRandomPassword } from 'src/utils/password.utils';
import { UsersRepo } from 'src/users/user.repo';
import { EmployeeRepo } from './employee.repo';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel('Employee') private employeeModel: Model<Employee>,
    private userRepo: UsersRepo,
    private userService: UsersService,
    private employeeRepo: EmployeeRepo,
  ) {}

  // Corrected createEmployee function
  async createEmployees(
    employeesData: {
      name: string;
      role: 'developer' | 'tester';
      designation: string;
      email: string;
      proficiency: string[];
    }[],
    companyId: string,
  ) {
    const createdEmployees = await Promise.all(
      employeesData.map(async (data) => {
        const { name, role, designation, email, proficiency } = data;
        const password = generateRandomPassword(8);
        const existingEmployee = await this.employeeRepo.findEmployeeByEmail(
          email,
          companyId,
        );

        if (existingEmployee) {
          return existingEmployee;
        }
        // Check if the user already exists
        let user = await this.userRepo.findByEmail(email);

        // If the user doesn't exist, create a new user
        if (!user) {
          user = await this.userService.createUser(
            email,
            password,
            'developer',
          );
        }

        // Create the employee and return it
        return this.employeeRepo.createEmployee(
          user._id.toString(), // Ensure _id is passed as a string
          companyId,
          name,
          role,
          designation,
          email,
          proficiency,
        );
      }),
    );

    return createdEmployees;
  }

  async getEmployeeById(employeeId: string, companyId): Promise<Employee> {
    const employee = await this.employeeModel.findById(employeeId, companyId);
    if (!employee) {
      throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
    }
    return employee;
  }
}
