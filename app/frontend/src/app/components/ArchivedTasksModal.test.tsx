import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArchivedTasksModal from './ArchivedTasksModal';

// Usamos jest.spyOn para criar um mock seguro e com tipagem para a função fetch global.
// Isso é mais robusto do que a reatribuição direta.
const fetchMock = jest.spyOn(global, 'fetch');

const mockTasks = [
  { id: 1, name: 'Tarefa Arquivada 1', status: 'done', archived: true },
  { id: 2, name: 'Tarefa Arquivada 2', status: 'doing', archived: true },
];

describe('ArchivedTasksModal', () => {
  // Antes de cada teste, limpamos o histórico de chamadas do mock para garantir isolamento.
  beforeEach(() => {
    fetchMock.mockClear();
  });

  it('deve renderizar o estado de carregamento inicialmente', () => {
    // Simulamos uma chamada de API que nunca se resolve para testar o estado de loading.
    fetchMock.mockImplementationOnce(() => new Promise(() => {}));
    render(<ArchivedTasksModal boardId={1} onClose={() => {}} />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('deve exibir as tarefas arquivadas após o carregamento', async () => {
    // Configura o mock do fetch para retornar nossas tarefas de exemplo
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTasks),
    } as Response);

    render(<ArchivedTasksModal boardId={1} onClose={() => {}} />);

    // `findByText` aguarda o elemento aparecer. É uma forma mais limpa de lidar com UI assíncrona.
    expect(await screen.findByText('Tarefa Arquivada 1')).toBeInTheDocument();
    expect(screen.getByText('Tarefa Arquivada 2')).toBeInTheDocument();
    expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
  });

  it('deve exibir uma mensagem quando não houver tarefas arquivadas', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]), // Retorna um array vazio
    } as Response);

    render(<ArchivedTasksModal boardId={1} onClose={() => {}} />);

    expect(await screen.findByText('Nenhuma tarefa arquivada neste quadro.')).toBeInTheDocument();
  });

  it('deve exibir uma mensagem de erro se a busca falhar', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Erro na API' }),
    } as Response);

    render(<ArchivedTasksModal boardId={1} onClose={() => {}} />);

    expect(await screen.findByText('Erro na API')).toBeInTheDocument();
  });

  it('deve chamar a função onClose quando o botão "Fechar" for clicado', async () => {
    const handleClose = jest.fn();
    // Precisamos mockar a resposta do fetch para que o componente saia do estado de loading
    // e renderize o botão "Fechar" para que possamos clicar nele.
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    render(<ArchivedTasksModal boardId={1} onClose={handleClose} />);

    // Usamos userEvent para simular a interação do usuário de forma mais realista
    // Aguardamos o botão aparecer, pois o componente começa em estado de loading.
    const closeButton = await screen.findByRole('button', { name: /Fechar/i });
    await userEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
