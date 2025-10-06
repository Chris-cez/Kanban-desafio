import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse, delay } from 'msw';
import BoardDetailPage from './page';

// Mock do roteamento do Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useParams: () => ({
    boardId: '1',
  }),
}));

// Mock dos modais para não testá-los aqui
jest.mock('../../components/EditTaskModal', () => ({
  __esModule: true,
  default: ({ isOpen, task }: { isOpen: boolean; task: any }) =>
    isOpen && task ? <div data-testid="edit-task-modal">Editando: {task.name}</div> : null,
}));
jest.mock('../../components/CreateTaskModal', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="create-task-modal">Criando Tarefa</div> : null,
}));

const meta: Meta<typeof BoardDetailPage> = {
  title: 'Pages/BoardDetail',
  component: BoardDetailPage,
  parameters: {
    // Simula o localStorage para o token de autenticação
    initialEntries: ['/boards/1'],
    nextjs: {
      router: {
        pathname: '/boards/[boardId]',
        query: {
          boardId: '1',
        },
      },
    },
    // Desabilita o layout padrão para renderizar a página inteira
    layout: 'fullscreen',
  },
  // Adiciona um decorator global para simular o localStorage
  decorators: [
    (Story) => {
      // Storybook não tem localStorage, então precisamos simular
      global.localStorage.setItem('access_token', 'fake-token-for-storybook');
      return <Story />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof BoardDetailPage>;

const mockBoardData = {
  id: 1,
  name: 'Projeto de Exemplo',
  taskStatuses: ['A Fazer', 'Em Progresso', 'Concluído'],
  tasks: [
    { id: 101, name: 'Configurar Storybook', status: 'Concluído', archived: false, description: '' },
    { id: 102, name: 'Criar história para TaskCard', status: 'Em Progresso', archived: false, description: '' },
    { id: 103, name: 'Documentar componente Column', status: 'A Fazer', archived: false, description: '' },
    { id: 104, name: 'Beber um café', status: 'A Fazer', archived: false, description: 'Muito importante.' },
  ],
  currentUserPermission: 'write',
};

// História principal, com a API retornando sucesso
export const Default: Story = {
  name: 'Visão Padrão',
  parameters: {
    msw: {
      handlers: [
        http.get(`${process.env.NEXT_PUBLIC_API_URL}/boards/1`, () => {
          return HttpResponse.json(mockBoardData);
        })
      ],
    },
  },
};

// História para o estado de carregamento
export const Loading: Story = {
  name: 'Carregando',
  parameters: {
    msw: {
      handlers: [
        http.get(`${process.env.NEXT_PUBLIC_API_URL}/boards/1`, async () => {
          // Adiciona um delay para que o estado de loading seja visível
          await delay('infinite');
          return new Response(null, { status: 200 });
        })
      ],
    },
  },
};

// História para o estado de erro
export const Error: Story = {
  name: 'Erro ao Carregar',
  parameters: {
    msw: {
      handlers: [
        http.get(`${process.env.NEXT_PUBLIC_API_URL}/boards/1`, () => {
          return HttpResponse.json({ message: 'Quadro não encontrado.' }, { status: 404 });
        })
      ],
    },
  },
};