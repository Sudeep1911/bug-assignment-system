import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { EmployeeService } from './employee.service';

@Controller('employee')
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}
  // @Post('company/:companyId/create')
  // async createEmployees(
  //   @Body()
  //   body: {
  //     employees: {
  //       name: string;
  //       role: 'developer' | 'tester';
  //       designation: string;
  //       email: string;
  //       proficiency: string[];
  //     }[];
  //   },
  //   @Param('companyId') companyId: string,
  // ) {
  //   // Pass the list of employees to the service to create them
  //   return await this.employeeService.createEmployees(
  //     body.employees,
  //     companyId,
  //   );
  // }

  @Get('company/:companyId/employee/:employeeId')
  async getEmployee(
    @Param('companyId') companyId: string,
    @Param('employeeId') employeeId: string,
  ) {
    return await this.employeeService.getEmployeeById(employeeId, companyId);
  }
}
