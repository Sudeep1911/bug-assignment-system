import { MongooseModule } from '@nestjs/mongoose';
import { TaskController } from './tasks.controller';
import { TaskService } from './tasks.service';
import { forwardRef, Module } from '@nestjs/common';
import { TaskSchema } from './tasks.schema';
import { KanbanStageSchema } from 'src/kanbanStages/kanbanStages.schema';
import { GPTModule } from 'src/gpt/gpt.module';
import { ChatMessageSchema } from './chat.shema';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { KanbanStagesModule } from 'src/kanbanStages/kanbanStages.module';
import { GcpService } from './gcp.service';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Task', schema: TaskSchema }]),
    MongooseModule.forFeature([
      { name: 'ChatMessage', schema: ChatMessageSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'KanbanStages', schema: KanbanStageSchema },
    ]),
    forwardRef(() => GPTModule),
    KanbanStagesModule,
  ],
  controllers: [TaskController, ChatController],
  providers: [TaskService, ChatService, ChatGateway, GcpService],
  exports: [TaskService, ChatService],
})
export class TaskModule {}
