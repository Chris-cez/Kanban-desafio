import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardMemberPermission } from '../../dto/create-board-member.dto';
import { Task } from '../../entities/tasks.entity';
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
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
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
    let boardId = request.body?.boardId || request.query?.boardId;

    // Se o boardId não foi encontrado no corpo ou na query, tentamos derivá-lo dos parâmetros da rota.
    if (!boardId && request.params.id) {
      const idFromParams = Number(request.params.id);
      const routePath = request.route.path;

      if (routePath.startsWith('/tasks/')) {
        // Se a rota é de uma tarefa, buscamos a tarefa para encontrar seu boardId.
        const task = await this.taskRepository.findOne({ where: { id: idFromParams }, relations: ['board'] });
        if (!task) throw new NotFoundException(`Task with ID ${idFromParams} not found`);
        boardId = task.board.id;
      } else if (routePath.startsWith('/board-members/')) {
        // Se a rota é de um membro, buscamos o membro para encontrar seu boardId.
        const member = await this.boardMemberRepository.findOne({ where: { id: idFromParams }, relations: ['board'] });
        if (!member) throw new NotFoundException(`Board member with ID ${idFromParams} not found`);
        boardId = member.board.id;
      } else {
        // Caso contrário, assumimos que o ID na URL é o próprio boardId (ex: /boards/:id).
        boardId = idFromParams;
      }
    }

    if (!user || !boardId) {
      // Se não for possível determinar o usuário ou o boardId, a permissão é negada.
      // Isso pode acontecer se a rota não estiver configurada corretamente (ex: faltando :boardId no path).
      throw new ForbiddenException('Cannot determine board context for permission check.');
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