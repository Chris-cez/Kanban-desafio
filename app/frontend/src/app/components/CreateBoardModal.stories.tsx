import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import CreateBoardModal from './CreateBoardModal';

const meta: Meta<typeof CreateBoardModal> = {
  title: 'Components/Modals/CreateBoardModal',
  component: CreateBoardModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onClose: { action: 'closed' },
    onBoardCreated: { action: 'boardCreated' },
  },
};

export default meta;
type Story = StoryObj<typeof CreateBoardModal>;

export const Default: Story = {
  name: 'Visão Padrão',
  args: {
    isOpen: true,
  },
  parameters: {
    msw: {
      handlers: [
        http.post(
          `${process.env.NEXT_PUBLIC_API_URL}/boards`,
          async ({ request }) => {
            const newBoard = await request.json();
            // @ts-ignore
            return HttpResponse.json({ id: Math.random(), ...newBoard });
          },
        ),
      ],
    },
  },
};