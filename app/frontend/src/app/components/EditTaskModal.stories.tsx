import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import EditTaskModal from './EditTaskModal';
import { Task } from '../boards/[boardId]/page';

const meta: Meta<typeof EditTaskModal> = {
  title: 'Components/Modals/EditTaskModal',
  component: EditTaskModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    msw: {
      handlers: [
        http.patch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/1`, async ({ request }) => {
          const updates = (await request.json()) as object;
          if (typeof updates !== 'object' || updates === null) {
            return new HttpResponse(null, { status: 400 });
          }
          return HttpResponse.json({ ...mockTask, ...updates });
        }),
      ],
    },
  },
  argTypes: {
    onClose: { action: 'closed' },
    onTaskUpdated: { action: 'taskUpdated' },
  },
};

export default meta;
type Story = StoryObj<typeof EditTaskModal>;

const mockTask: Task = {
  id: 1,
  name: 'Refatorar componente de Modal',
  description: 'O modal precisa de um estado de carregamento e feedback de erro.',
  status: 'Em Progresso',
  archived: false,
};

const mockStatuses = ['A Fazer', 'Em Progresso', 'Concluído'];

export const Default: Story = {
  name: 'Visão Padrão (Permissão de Escrita)',
  args: {
    isOpen: true,
    task: mockTask,
    statuses: mockStatuses,
    currentUserPermission: 'write',
  },
};

export const ReadOnly: Story = {
  name: 'Modo Leitura',
  args: {
    ...Default.args,
    currentUserPermission: 'read',
  },
};

export const Admin: Story = {
  name: 'Modo Admin',
  args: {
    ...Default.args,
    currentUserPermission: 'admin',
  },
};

export const NoTask: Story = {
  name: 'Sem Tarefa (Fechado)',
  args: {
    isOpen: false,
    task: null,
    statuses: mockStatuses,
  },
};