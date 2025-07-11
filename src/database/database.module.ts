import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://sudeepkarthigeyan20:NLVHDm7yez2m1Ftz@users.af7falz.mongodb.net/?retryWrites=true&w=majority&appName=Users',
    ),
  ],
})
export class DatabaseModule {}
