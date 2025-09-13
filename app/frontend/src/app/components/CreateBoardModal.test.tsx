import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateBoardModal from './CreateBoardModal';

const fetchMock = jest.spyOn(global, 'fetch');

describe('CreateBoardModal', () => {
  const handleClose = jest.fn();
  const handleBoardCreated = jest.fn();

  beforeEach(() => {
    fetchMock.mockClear();
    handleClose.mockClear();
    handleBoardCreated.mockClear();
    Storage.prototype.getItem = jest.fn(() => 'fake_token');
  });

  it('não deve renderizar quando isOpen for falso', () => {
    const { container } = render(
      <CreateBoardModal isOpen={false} onClose={handleClose} onBoardCreated={handleBoardCreated} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('deve renderizar o formulário quando isOpen for verdadeiro', () => {
    render(<CreateBoardModal isOpen={true} onClose={handleClose} onBoardCreated={handleBoardCreated} />);
    expect(screen.getByRole('heading', { name: /Criar Novo Quadro/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome do Quadro/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Criar Quadro/i })).toBeInTheDocument();
  });

  it('deve chamar onClose ao clicar em Cancelar', async () => {
    render(<CreateBoardModal isOpen={true} onClose={handleClose} onBoardCreated={handleBoardCreated} />);
    await userEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('deve submeter o formulário e criar um quadro com sucesso', async () => {
    const newBoard = { id: 1, name: 'Novo Quadro', taskStatuses: ['A Fazer'] };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(newBoard),
    } as Response);

    render(<CreateBoardModal isOpen={true} onClose={handleClose} onBoardCreated={handleBoardCreated} />);

    await userEvent.type(screen.getByLabelText(/Nome do Quadro/i), 'Novo Quadro');
    await userEvent.type(screen.getByLabelText(/Status das Tarefas/i), 'A Fazer');
    await userEvent.click(screen.getByRole('button', { name: /Criar Quadro/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/boards'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Novo Quadro', taskStatuses: ['A Fazer'] }),
      })
    );

    expect(handleBoardCreated).toHaveBeenCalledWith(newBoard);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('deve exibir uma mensagem de erro se a criação do quadro falhar', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Nome já existe' }),
    } as Response);

    render(<CreateBoardModal isOpen={true} onClose={handleClose} onBoardCreated={handleBoardCreated} />);

    await userEvent.type(screen.getByLabelText(/Nome do Quadro/i), 'Quadro Repetido');
    await userEvent.click(screen.getByRole('button', { name: /Criar Quadro/i }));

    expect(await screen.findByText('Nome já existe')).toBeInTheDocument();
    expect(handleBoardCreated).not.toHaveBeenCalled();
    expect(handleClose).not.toHaveBeenCalled();
  });
});