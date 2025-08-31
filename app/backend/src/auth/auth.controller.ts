import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from '../dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
  const user = await this.authService.validateUser(loginDto.login, loginDto.password);
  if (!user) {
    throw new UnauthorizedException('Credenciais inválidas');
  }
  return this.authService.login(user);
}
}