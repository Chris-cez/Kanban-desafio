import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from './page';

// Mock de dependências externas
const mockRouter = {
  push: jest.fn(),
};
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

const fetchMock = jest.spyOn(global, 'fetch');

// Mock dos modais para isolar o teste da página
jest.mock('../components/CreateBoardModal', () => ({ isOpen }: { isOpen: boolean }) =>
  isOpen ? <div data-testid="create-board-modal">Criar Quadro</div> : null
);
jest.mock('../components/DeleteBoardModal', () => ({ boardId }: { boardId: number | null }) =>
  boardId ? <div data-testid="delete-board-modal">Deletar Quadro {boardId}</div> : null
);
jest.mock('../components/ManageMembersModal', () => ({ boardId }: { boardId: number | null }) =>
  boardId ? <div data-testid="manage-members-modal">Gerenciar Membros {boardId}</div> : null
);
jest.mock('../components/ArchivedTasksModal', () => ({ boardId }: { boardId: number | null }) =>
  boardId ? <div data-testid="archived-tasks-modal">Arquivados {boardId}</div> : null
);

const mockBoards = [
  { id: 1, name: 'Meu Primeiro Quadro', taskStatuses: [] },
  { id: 2, name: 'Projeto Secreto', taskStatuses: [] },
];

describe('DashboardPage', () => {
  beforeEach(() => {
    fetchMock.mockClear();
    mockRouter.push.mockClear();
    Storage.prototype.getItem = jest.fn(() => 'fake_token');
  });

  it('deve redirecionar para o login se não houver token', () => {
    Storage.prototype.getItem = jest.fn(() => null);
    render(<DashboardPage />);
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });

  it('deve exibir o estado de carregamento e depois renderizar os quadros', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBoards),
    } as Response);

    render(<DashboardPage />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();

    expect(await screen.findByText('Meu Primeiro Quadro')).toBeInTheDocument();
    expect(screen.getByText('Projeto Secreto')).toBeInTheDocument();
    expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
  });

  it('deve exibir uma mensagem de erro se a busca falhar', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Erro de servidor' }),
    } as Response);

    render(<DashboardPage />);
    expect(await screen.findByText('Falha ao buscar os quadros.')).toBeInTheDocument();
  });

  it('deve exibir uma mensagem quando não houver quadros', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    render(<DashboardPage />);
    expect(await screen.findByText('Você ainda não tem quadros. Crie um para começar!')).toBeInTheDocument();
  });

  it('deve abrir o modal de criação de quadro', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) } as Response);
    render(<DashboardPage />);
    await screen.findByText('Criar Novo Quadro');

    expect(screen.queryByTestId('create-board-modal')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Criar Novo Quadro/i }));
    expect(screen.getByTestId('create-board-modal')).toBeInTheDocument();
  });

  it('deve abrir os modais de ação do quadro ao clicar nos botões', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBoards),
    } as Response);
    render(<DashboardPage />);
    const boardCard = await screen.findByText('Meu Primeiro Quadro');
    const boardContainer = boardCard.parentElement!;

    // Teste do modal de arquivados
    await userEvent.click(screen.getByRole('button', { name: /Arquivados/i }));
    expect(await screen.findByTestId('archived-tasks-modal')).toHaveTextContent('Arquivados 1');

    // Teste do modal de convidar
    await userEvent.click(screen.getByRole('button', { name: /Convidar/i }));
    expect(await screen.findByTestId('manage-members-modal')).toHaveTextContent('Gerenciar Membros 1');

    // Teste do modal de deletar
    await userEvent.click(screen.getByRole('button', { name: /Deletar/i }));
    expect(await screen.findByTestId('delete-board-modal')).toHaveTextContent('Deletar Quadro 1');
  });

  it('deve navegar para a página do quadro com um duplo clique', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBoards),
    } as Response);
    render(<DashboardPage />);
    const boardCard = await screen.findByText('Meu Primeiro Quadro');

    await userEvent.dblClick(boardCard);
    expect(mockRouter.push).toHaveBeenCalledWith('/boards/1');
  });
});