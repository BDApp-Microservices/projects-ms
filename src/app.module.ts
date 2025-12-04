import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envs } from './config';


@Module({
  imports: [
    // Other modules can be imported here
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: envs.dbhost,
      port: envs.dbport,
      username: envs.dbuser,
      password: envs.dbpassword,
      database: envs.dbname,
      synchronize: envs.nodeEnv !== 'production',
      autoLoadEntities: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
