import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { BoardMemberGuard } from './guards/board-member.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardMember } from '../entities/board-members.entity';
import { Task } from '../entities/tasks.entity';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([BoardMember, Task]),
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    forwardRef(() => UsersModule),
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy, BoardMemberGuard],
  exports: [AuthService, BoardMemberGuard],
  controllers: [AuthController]
})
export class AuthModule {}