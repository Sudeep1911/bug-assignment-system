import { MongooseModule } from "@nestjs/mongoose";
import { TaskController } from "./tasks.controller";
import { TaskService } from "./tasks.service";
import { forwardRef, Module } from '@nestjs/common';
import { TaskSchema } from "./tasks.schema";
import { KanbanStageSchema } from "src/kanbanStages/kanbanStages.schema";
import { GPTModule } from "src/gpt/gpt.module";
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Task', schema: TaskSchema }]),MongooseModule.forFeature([{ name: 'KanbanStages', schema: KanbanStageSchema }]),forwardRef(() => GPTModule)
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}