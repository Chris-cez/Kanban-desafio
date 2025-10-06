import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import ManageMembersModal from './ManageMembersModal';

const meta: Meta<typeof ManageMembersModal> = {
  title: 'Components/Modals/ManageMembersModal',
  component: ManageMembersModal,
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
type Story = StoryObj<typeof ManageMembersModal>;

const mockMembers = [
  { id: 1, permissions: 'admin', user: { id: 10, login: 'admin.user' } },
  { id: 2, permissions: 'write', user: { id: 11, login: 'editor.user' } },
  { id: 3, permissions: 'read', user: { id: 12, login: 'viewer.user' } },
];

export const Default: Story = {
  name: 'Visão Padrão',
  args: {
    boardId: 1,
  },
  parameters: {
    msw: {
      handlers: [
        http.get(`${process.env.NEXT_PUBLIC_API_URL}/board-members?boardId=1`, () => {
          return HttpResponse.json(mockMembers);
        }),
        http.post(`${process.env.NEXT_PUBLIC_API_URL}/board-members`, async ({ request }) => {
          const newMember = (await request.json()) as any;
          return HttpResponse.json({
            id: Math.random(),
            permissions: newMember.permissions,
            user: { id: Math.random(), login: newMember.userLogin },
          });
        }),
        http.delete(`${process.env.NEXT_PUBLIC_API_URL}/board-members/:id`, () => {
          return new HttpResponse(null, { status: 204 });
        }),
      ],
    },
  },
};