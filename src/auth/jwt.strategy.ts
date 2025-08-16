import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Onde buscar o token na requisição
      ignoreExpiration: false, // Não ignora a expiração do token
      secretOrKey: process.env.JWT_SECRET, // Chave secreta para assinar/validar o token
    });
  }

  async validate(payload: { sub: number; login: string }) {
    const user = await this.usersService.findByLogin(payload.login);
    if (!user) {
      throw new UnauthorizedException();
    }
    // O que for retornado aqui é injetado em req.user nas rotas protegidas
    return user;
  }
}