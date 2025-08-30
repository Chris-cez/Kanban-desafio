import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { BoardsModule } from 'src/boards/boards.module';
import { BoardMembersModule } from 'src/board-members/board-members.module';
import { TasksModule } from 'src/tasks/tasks.module';
import { AuthModule } from 'src/auth/auth.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST ?? 'localhost',
      port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
      username: process.env.DATABASE_USER ?? 'root',
      password: process.env.DATABASE_PASSWORD ?? 'root',
      database: process.env.DATABASE_NAME ?? 'kanban',
      entities: [__dirname + '/../entities/*.entity.{ts,js}'],
      synchronize: true,
    }),
    UsersModule,
    BoardsModule,
    BoardMembersModule,
    TasksModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
