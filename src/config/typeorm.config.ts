import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../user/user.entity';
import { Organisation } from '../organisation/organisation.entity';
// Load environment variables from .env file
dotenvConfig({ path: '.env' });

// Define the TypeORM configuration object
const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10), // Ensure the port is a number
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [User, Organisation],
  migrationsTableName: 'HNG', 
  migrations: ['src/migrations/*.ts'], 
  synchronize: false,
  
};

// Export the TypeORM configuration using registerAs for NestJS
export default registerAs('typeorm', () => typeOrmConfig);

// Create a new DataSource instance
export const connectionSource = new DataSource(typeOrmConfig);
