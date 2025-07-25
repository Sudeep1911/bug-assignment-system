import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeSchema } from './employee.schema';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { UsersModule } from 'src/users/user.module';
import { EmployeeRepo } from './employee.repo';
import { CompanyModule } from 'src/company/company.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Employee', schema: EmployeeSchema }]),
    UsersModule,
    CompanyModule,
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService, EmployeeRepo],
  exports: [EmployeeService, EmployeeRepo],
})
export class EmployeeModule {}
