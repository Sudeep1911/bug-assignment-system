import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { UserSchema } from './user.schema';
import { UsersRepo } from './user.repo';
import { EmployeeModule } from 'src/employee/employee.module';
import { CompanyModule } from 'src/company/company.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    forwardRef(() => CompanyModule),
  ],
  controllers: [UsersController],
  providers: [UsersController, UsersService, UsersRepo],
  exports: [UsersService, UsersRepo],
})
export class UsersModule {}
