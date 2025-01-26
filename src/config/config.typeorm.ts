import { DataSource, DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import { registerAs } from '@nestjs/config';

dotenvConfig({ path: '.env.development' });

const config = {
  type: 'mssql',
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  autoLoadEntities: true,
  synchronize: true,
  logging: false,
  dropSchema: true,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  options: {
    encrypt: true, // Cifrado de conexión para SQL Server
    trustServerCertificate: true, // Permite certificados autofirmados, útil con Docker
  },
};
export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
