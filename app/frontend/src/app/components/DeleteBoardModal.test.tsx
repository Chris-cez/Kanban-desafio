import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteBoardModal from './DeleteBoardModal';

const fetchMock = jest.spyOn(global, 'fetch');

describe('DeleteBoardModal', () => {
  const handleClose = jest.fn();
  const handleBoardDeleted = jest.fn();

  beforeEach(() => {
    fetchMock.mockClear();
    handleClose.mockClear();
    handleBoardDeleted.mockClear();
    Storage.prototype.getItem = jest.fn(() => 'fake_token');
  });

  it('não deve renderizar se boardId for nulo', () => {
    const { container } = render(
      <DeleteBoardModal boardId={null} onClose={handleClose} onBoardDeleted={handleBoardDeleted} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('deve renderizar a confirmação quando o boardId for fornecido', () => {
    render(<DeleteBoardModal boardId={1} onClose={handleClose} onBoardDeleted={handleBoardDeleted} />);
    expect(screen.getByRole('heading', { name: /Confirmar Exclusão/i })).toBeInTheDocument();
    expect(screen.getByText(/Você tem certeza que deseja deletar este quadro?/)).toBeInTheDocument();
  });

  it('deve chamar a API para deletar e fechar o modal com sucesso', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    render(<DeleteBoardModal boardId={123} onClose={handleClose} onBoardDeleted={handleBoardDeleted} />);

    await userEvent.click(screen.getByRole('button', { name: /Deletar/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/boards/123'),
      expect.objectContaining({ method: 'DELETE' })
    );

    expect(handleBoardDeleted).toHaveBeenCalledWith(123);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('deve exibir uma mensagem de erro se a deleção falhar', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Permissão negada' }),
    } as Response);

    render(<DeleteBoardModal boardId={1} onClose={handleClose} onBoardDeleted={handleBoardDeleted} />);
    await userEvent.click(screen.getByRole('button', { name: /Deletar/i }));

    expect(await screen.findByText('Permissão negada')).toBeInTheDocument();
    expect(handleBoardDeleted).not.toHaveBeenCalled();
    expect(handleClose).not.toHaveBeenCalled();
  });
});