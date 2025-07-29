import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KanbanStageSchema } from './kanbanStages.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'KanbanStages', schema: KanbanStageSchema }]),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class KanbanStagesModule {}
