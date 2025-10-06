import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import ArchivedTasksModal from './ArchivedTasksModal';

const meta: Meta<typeof ArchivedTasksModal> = {
  title: 'Components/Modals/ArchivedTasksModal',
  component: ArchivedTasksModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onClose: { action: 'closed' },
  },
  decorators: [
    (Story) => {
      global.localStorage.setItem('access_token', 'fake-token-for-storybook');
      return <Story />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof ArchivedTasksModal>;

const mockArchivedTasks = [
  { id: 1, name: 'Tarefa Arquivada 1', status: 'done', archived: true },
  { id: 2, name: 'Tarefa Arquivada 2', status: 'doing', archived: true },
];

export const Default: Story = {
  name: 'Com Tarefas Arquivadas',
  args: {
    boardId: 1,
  },
  parameters: {
    msw: {
      handlers: [
        http.get(`${process.env.NEXT_PUBLIC_API_URL}/tasks?boardId=1&archived=true`, () => {
          return HttpResponse.json(mockArchivedTasks);
        }),
      ],
    },
  },
};

export const Empty: Story = {
  name: 'Sem Tarefas Arquivadas',
  args: {
    boardId: 1,
  },
  parameters: {
    msw: {
      handlers: [
        http.get(`${process.env.NEXT_PUBLIC_API_URL}/tasks?boardId=1&archived=true`, () => {
          return HttpResponse.json([]);
        }),
      ],
    },
  },
};

export const ErrorState: Story = {
  name: 'Estado de Erro',
  args: {
    boardId: 1,
  },
  parameters: {
    msw: {
      handlers: [
        http.get(`${process.env.NEXT_PUBLIC_API_URL}/tasks?boardId=1&archived=true`, () => {
          return HttpResponse.json({ message: 'Acesso negado' }, { status: 403 });
        }),
      ],
    },
  },
};