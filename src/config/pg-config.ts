import { registerAs } from '@nestjs/config';

export default registerAs('PG_CONFIG', () => ({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  dbName: process.env.PG_DATABASE_NAME,
}));
