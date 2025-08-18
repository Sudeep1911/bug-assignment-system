import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/user.module';
import { CompanyModule } from './company/company.module';
import { EmployeeModule } from './employee/employee.module';
import { ProductModule } from './product/product.module';
import { GPTModule } from './gpt/gpt.module';
import { KanbanStagesModule } from './kanbanStages/kanbanStages.module';
import { ModulesModule } from './modules/modules.module';
import { TaskModule } from './tasks/tasks.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    CompanyModule,
    EmployeeModule,
    ProductModule,
    KanbanStagesModule,
    ModulesModule,
    GPTModule,
    TaskModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
