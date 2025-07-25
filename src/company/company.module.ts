import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanySchema } from './company.schema';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { UsersModule } from 'src/users/user.module';
import { CompanyRepo } from './company.repo';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Company', schema: CompanySchema }]),
    forwardRef(() => UsersModule),
  ],
  controllers: [CompanyController],
  providers: [CompanyController, CompanyService, CompanyRepo],
  exports: [CompanyService, CompanyRepo],
})
export class CompanyModule {}
