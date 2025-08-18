import { forwardRef, Module } from '@nestjs/common';
import { GPTController } from './gpt.controller';
import { GPTService } from './gpt.sevice';
import { ModulesModule } from 'src/modules/modules.module';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [ModulesModule,forwardRef(() => ProductModule)],
  controllers: [GPTController],
  exports: [GPTService],
  providers: [GPTService],
})
export class GPTModule {}
