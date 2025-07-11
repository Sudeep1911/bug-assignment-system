import { Injectable, OnModuleInit } from '@nestjs/common';
import { MongoClient } from 'mongodb';

@Injectable()
export class MongoClientService implements OnModuleInit {
  private client: MongoClient;

  async onModuleInit() {
    const uri =
      'mongodb+srv://sudeepkarthigeyan20:NLVHDm7yez2m1Ftz@users.af7falz.mongodb.net/?retryWrites=true&w=majority&appName=Users';
    this.client = new MongoClient(uri, {
      serverApi: { version: '1', strict: true, deprecationErrors: true },
    });
    await this.client.connect();
    console.log('Connected to MongoDB successfully!');
  }

  getClient() {
    return this.client;
  }
}
