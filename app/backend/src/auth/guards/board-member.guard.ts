import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardMemberPermission } from '../../dto/create-board-member.dto';
import { BoardMember } from '../../entities/board-members.entity';
import { Repository } from 'typeorm';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: BoardMemberPermission[]) => SetMetadata(PERMISSIONS_KEY, permissions);

const PERMISSION_HIERARCHY: Record<BoardMemberPermission, number> = {
  [BoardMemberPermission.READ]: 1,
  [BoardMemberPermission.WRITE]: 2,
  [BoardMemberPermission.ADMIN]: 3,
};

@Injectable()
export class BoardMemberGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(BoardMember)
    private boardMemberRepository: Repository<BoardMember>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<BoardMemberPermission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se nenhuma permissão for necessária, permite o acesso.
    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Injetado pelo AuthGuard('jwt')
    const boardId = request.params.boardId || request.body.boardId || request.params.id;

    if (!user || !boardId) {
      // Não deveria acontecer se o AuthGuard estiver ativo e a rota bem definida.
      return false;
    }

    const boardMembership = await this.boardMemberRepository.findOne({
      where: {
        user: { id: user.id },
        board: { id: boardId },
      },
    });

    if (!boardMembership) {
      throw new NotFoundException('You are not a member of this board.');
    }

    const userPermissionLevel = PERMISSION_HIERARCHY[boardMembership.permissions];

    const hasPermission = requiredPermissions.some((requiredPermission) => {
      const requiredLevel = PERMISSION_HIERARCHY[requiredPermission];
      return userPermissionLevel >= requiredLevel;
    });

    if (!hasPermission) {
      throw new ForbiddenException('You do not have the required permissions for this action.');
    }

    return true;
  }
}