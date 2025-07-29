import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KanbanStage, KanbanStageSchema } from 'src/kanbanStages/kanbanStages.schema';

import { ProjectSchema } from './product.schema';
import { ProjectController } from './product.controller';
import { ProjectService } from './product.service';
import { KanbanStagesModule } from 'src/kanbanStages/kanbanStages.module';
import { ModulesModule } from 'src/modules/modules.module';
import { UsersModule } from 'src/users/user.module';
import { ModulesSchema } from 'src/modules/modules.schema';
import { UserSchema } from 'src/users/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Project', schema: ProjectSchema },{ name: 'KanbanStages', schema: KanbanStageSchema },{ name: 'Modules', schema: ModulesSchema },{ name: 'User', schema: UserSchema }]),KanbanStagesModule,ModulesModule,UsersModule
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProductModule {}
