import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import DeleteBoardModal from './DeleteBoardModal';

const meta: Meta<typeof DeleteBoardModal> = {
  title: 'Components/Modals/DeleteBoardModal',
  component: DeleteBoardModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onClose: { action: 'closed' },
    onBoardDeleted: { action: 'boardDeleted' },
  },
};

export default meta;
type Story = StoryObj<typeof DeleteBoardModal>;

export const Default: Story = {
  name: 'Visão Padrão',
  args: {
    boardId: 1,
  },
  parameters: {
    msw: {
      handlers: [
        http.delete(`${process.env.NEXT_PUBLIC_API_URL}/boards/1`, () => {
          return new HttpResponse(null, { status: 204 });
        }),
      ],
    },
  },
};