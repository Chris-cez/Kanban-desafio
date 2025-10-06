import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import DashboardPage from './page';

// Mock de dependências externas
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const meta: Meta<typeof DashboardPage> = {
  title: 'Pages/Dashboard',
  component: DashboardPage,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      router: {
        pathname: '/dashboard',
      },
    },
  },
  decorators: [
    (Story) => {
      global.localStorage.setItem('access_token', 'fake-token-for-storybook');
      return <Story />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof DashboardPage>;

const mockBoards = [
  { id: 1, name: 'Meu Primeiro Quadro', taskStatuses: [] },
  { id: 2, name: 'Projeto Secreto', taskStatuses: [] },
  { id: 3, name: 'Estudos de Fim de Semana', taskStatuses: [] },
];

export const Default: Story = {
  name: 'Visão Padrão com Quadros',
  parameters: {
    msw: {
      handlers: [
        http.get(`${process.env.NEXT_PUBLIC_API_URL}/boards`, () => {
          return HttpResponse.json(mockBoards);
        }),
      ],
    },
  },
};

export const EmptyState: Story = {
  name: 'Sem Quadros',
  parameters: {
    msw: {
      handlers: [
        http.get(`${process.env.NEXT_PUBLIC_API_URL}/boards`, () => {
          return HttpResponse.json([]);
        }),
      ],
    },
  },
};

export const Loading: Story = {
  name: 'Carregando',
  parameters: {
    msw: {
      handlers: [
        http.get(`${process.env.NEXT_PUBLIC_API_URL}/boards`, async () => {
          await new Promise(resolve => setTimeout(resolve, 30000));
          return HttpResponse.json(mockBoards);
        }),
      ],
    },
  },
};

export const ErrorState: Story = {
  name: 'Estado de Erro',
  parameters: {
    msw: {
      handlers: [
        http.get(`${process.env.NEXT_PUBLIC_API_URL}/boards`, () => {
          return HttpResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
        }),
      ],
    },
  },
};