import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BoardDetailPage from './page';

// Mock de dependências externas (roteamento, API, modais)
const mockRouter = {
  push: jest.fn(),
};
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useParams: () => ({ boardId: '1' }),
}));

const fetchMock = jest.spyOn(global, 'fetch');

jest.mock('../../components/EditTaskModal', () => ({ isOpen, task }: { isOpen: boolean, task: any }) =>
  isOpen && task ? <div data-testid="edit-task-modal">Editando: {task.name}</div> : null
);
jest.mock('../../components/CreateTaskModal', () => ({ isOpen }: { isOpen: boolean }) =>
  isOpen ? <div data-testid="create-task-modal">Criando Tarefa</div> : null
);

const mockBoardData = {
  id: 1,
  name: 'Quadro de Teste',
  taskStatuses: ['A Fazer', 'Em Progresso'],
  tasks: [
    { id: 101, name: 'Task A', status: 'A Fazer', archived: false, description: '' },
    { id: 102, name: 'Task B', status: 'Em Progresso', archived: false, description: '' },
  ],
  currentUserPermission: 'write',
};

describe('BoardDetailPage', () => {
  beforeEach(() => {
    fetchMock.mockClear();
    mockRouter.push.mockClear();
    // Mock do localStorage
    Storage.prototype.getItem = jest.fn(() => 'fake_token');
  });

  it('deve exibir o estado de carregamento e depois renderizar o quadro', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBoardData),
    } as Response);

    render(<BoardDetailPage />);

    expect(screen.getByText('Carregando quadro...')).toBeInTheDocument();

    expect(await screen.findByText('Quadro de Teste')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'A Fazer' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Em Progresso' })).toBeInTheDocument();
    expect(screen.getByText('Task A')).toBeInTheDocument();
    expect(screen.getByText('Task B')).toBeInTheDocument();
  });

  it('deve exibir uma mensagem de erro se a busca falhar', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Quadro não encontrado' }),
    } as Response);

    render(<BoardDetailPage />);

    expect(await screen.findByText('Erro: Quadro não encontrado')).toBeInTheDocument();
  });

  it('deve redirecionar para o login se não houver token', () => {
    Storage.prototype.getItem = jest.fn(() => null); // Simula ausência de token
    render(<BoardDetailPage />);
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });

  it('deve abrir o modal de criação de tarefa ao clicar em "+ Nova Tarefa"', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBoardData),
    } as Response);

    render(<BoardDetailPage />);
    await screen.findByText('Quadro de Teste'); // Garante que o quadro carregou

    expect(screen.queryByTestId('create-task-modal')).not.toBeInTheDocument();

    const createButton = screen.getByRole('button', { name: /\+ Nova Tarefa/i });
    await userEvent.click(createButton);

    expect(screen.getByTestId('create-task-modal')).toBeInTheDocument();
  });

  it('deve abrir o modal de edição ao dar duplo clique em uma tarefa', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBoardData),
    } as Response);

    render(<BoardDetailPage />);
    await screen.findByText('Quadro de Teste');

    expect(screen.queryByTestId('edit-task-modal')).not.toBeInTheDocument();

    const taskCard = screen.getByText('Task A');
    await userEvent.dblClick(taskCard);

    const editModal = await screen.findByTestId('edit-task-modal');
    expect(editModal).toBeInTheDocument();
    expect(editModal).toHaveTextContent('Editando: Task A');
  });

  it('deve navegar para o dashboard ao clicar em "Voltar para Quadros"', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBoardData),
    } as Response);

    render(<BoardDetailPage />);
    const backButton = await screen.findByRole('button', { name: /← Voltar para Quadros/i });
    await userEvent.click(backButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
  });
});