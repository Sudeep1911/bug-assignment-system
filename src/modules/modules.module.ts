import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModulesSchema } from './modules.schema';
import { ModulesRepo } from './modules.repo';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Modules', schema: ModulesSchema }]),
  ],
  controllers: [],
  providers: [ModulesRepo],
  exports: [ModulesRepo],
})
export class ModulesModule {}
