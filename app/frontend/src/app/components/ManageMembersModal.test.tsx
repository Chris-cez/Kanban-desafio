import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ManageMembersModal from './ManageMembersModal';

const fetchMock = jest.spyOn(global, 'fetch');

const mockMembers = [
  { id: 1, permissions: 'admin', user: { id: 1, login: 'admin_user' } },
  { id: 2, permissions: 'read', user: { id: 2, login: 'reader_user' } },
];

describe('ManageMembersModal', () => {
  const handleClose = jest.fn();

  beforeEach(() => {
    fetchMock.mockClear();
    handleClose.mockClear();
    Storage.prototype.getItem = jest.fn(() => 'fake_token');
    global.confirm = jest.fn(() => true); // Auto-confirma remoção
    global.alert = jest.fn();
  });

  it('deve buscar e exibir os membros do quadro', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockMembers),
    } as Response);

    render(<ManageMembersModal boardId={1} onClose={handleClose} />);

    expect(screen.getByText('Carregando membros...')).toBeInTheDocument();

    expect(await screen.findByText('admin_user')).toBeInTheDocument();
    expect(screen.getByText('reader_user')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('read')).toBeInTheDocument();
  });

  it('deve permitir adicionar um novo membro', async () => {
    const newMember = { id: 3, permissions: 'write', user: { id: 3, login: 'new_writer' } };

    // Primeira chamada para buscar membros existentes
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockMembers),
    } as Response);

    // Segunda chamada para adicionar o novo membro
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(newMember),
    } as Response);

    render(<ManageMembersModal boardId={1} onClose={handleClose} />);

    await screen.findByText('admin_user'); // Espera o carregamento inicial

    await userEvent.type(screen.getByPlaceholderText(/Login do usuário/i), 'new_writer');
    await userEvent.selectOptions(screen.getByRole('combobox'), 'write');
    await userEvent.click(screen.getByRole('button', { name: /Adicionar/i }));

    // Verifica se a API de adição foi chamada corretamente
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/board-members'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ boardId: 1, userLogin: 'new_writer', permissions: 'write' }),
      })
    );

    // Verifica se o novo membro apareceu na lista
    expect(await screen.findByText('new_writer')).toBeInTheDocument();
  });

  it('deve permitir remover um membro', async () => {
    // Chamada para buscar membros
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockMembers),
    } as Response);

    // Chamada para deletar o membro
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    render(<ManageMembersModal boardId={1} onClose={handleClose} />);

    const memberToRemoveRow = await screen.findByText('reader_user');
    const removeButtons = screen.getAllByRole('button', { name: /Remover/i });
    // Assumindo que o segundo botão de remover corresponde ao 'reader_user'
    await userEvent.click(removeButtons[1]);

    // Verifica se a confirmação foi chamada
    expect(global.confirm).toHaveBeenCalled();

    // Verifica se a API de deleção foi chamada
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/board-members/2'), // ID do 'reader_user'
      expect.objectContaining({ method: 'DELETE' })
    );

    // Verifica se o membro foi removido da UI
    await waitFor(() => {
      expect(screen.queryByText('reader_user')).not.toBeInTheDocument();
    });
  });
});