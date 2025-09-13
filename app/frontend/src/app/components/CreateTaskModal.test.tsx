import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateTaskModal from './CreateTaskModal';

const fetchMock = jest.spyOn(global, 'fetch');

describe('CreateTaskModal', () => {
  const handleClose = jest.fn();
  const handleTaskCreated = jest.fn();
  const mockStatuses = ['A Fazer', 'Em Progresso', 'Feito'];

  beforeEach(() => {
    fetchMock.mockClear();
    handleClose.mockClear();
    handleTaskCreated.mockClear();
    Storage.prototype.getItem = jest.fn(() => 'fake_token');
  });

  it('deve renderizar o formulário com o status inicial correto', () => {
    render(
      <CreateTaskModal
        isOpen={true}
        onClose={handleClose}
        onTaskCreated={handleTaskCreated}
        boardId={1}
        statuses={mockStatuses}
      />
    );

    expect(screen.getByRole('heading', { name: /Criar Nova Tarefa/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome da Tarefa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status Inicial/i)).toHaveValue('A Fazer');
  });

  it('deve submeter o formulário e criar uma tarefa com sucesso', async () => {
    const newTask = { id: 101, name: 'Nova Tarefa', description: 'Desc', status: 'A Fazer', archived: false };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(newTask),
    } as Response);

    render(
      <CreateTaskModal
        isOpen={true}
        onClose={handleClose}
        onTaskCreated={handleTaskCreated}
        boardId={1}
        statuses={mockStatuses}
      />
    );

    await userEvent.type(screen.getByLabelText(/Nome da Tarefa/i), 'Nova Tarefa');
    await userEvent.type(screen.getByLabelText(/Descrição/i), 'Desc');
    await userEvent.selectOptions(screen.getByLabelText(/Status Inicial/i), 'A Fazer');
    await userEvent.click(screen.getByRole('button', { name: /Criar Tarefa/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/tasks'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Nova Tarefa', description: 'Desc', status: 'A Fazer', boardId: 1 }),
      })
    );

    expect(handleTaskCreated).toHaveBeenCalledWith(newTask);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});