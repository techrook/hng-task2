import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { connectionSource } from '../config/typeorm.config'; // Adjust the path as needed

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private dataSource: DataSource;

  async onModuleInit() {
    this.dataSource = await connectionSource.initialize();
  }

  async onModuleDestroy() {
    await this.dataSource.destroy();
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }
}
