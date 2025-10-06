import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import CreateTaskModal from './CreateTaskModal';

const meta: Meta<typeof CreateTaskModal> = {
  title: 'Components/Modals/CreateTaskModal',
  component: CreateTaskModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onClose: { action: 'closed' },
    onTaskCreated: { action: 'taskCreated' },
  },
  decorators: [
    (Story) => {
      global.localStorage.setItem('access_token', 'fake-token-for-storybook');
      return <Story />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof CreateTaskModal>;

const mockStatuses = ['A Fazer', 'Em Progresso', 'Concluído'];

export const Default: Story = {
  name: 'Visão Padrão',
  args: {
    isOpen: true,
    boardId: 1,
    statuses: mockStatuses,
  },
  parameters: {
    msw: {
      handlers: [
        http.post(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, async ({ request }) => {
          const newTaskData = (await request.json()) as { name: string; description: string; status: string; boardId: number };
          return HttpResponse.json({
            id: Math.floor(Math.random() * 1000),
            name: newTaskData.name,
            description: newTaskData.description || null,
            status: newTaskData.status,
            archived: false,
          });
        }),
      ],
    },
  },
};