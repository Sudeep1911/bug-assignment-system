import { Module } from '@nestjs/common';
import { GPTController } from './gpt.controller';
import { GPTService } from './gpt.sevice';

@Module({
  imports: [],
  controllers: [GPTController],
  exports: [GPTService],
  providers: [GPTService],
})
export class GPTModule {}
