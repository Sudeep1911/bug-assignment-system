import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModulesSchema } from './modules.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Modules', schema: ModulesSchema }]),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class ModulesModule {}
