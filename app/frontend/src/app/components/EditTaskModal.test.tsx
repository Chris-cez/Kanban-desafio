import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditTaskModal from './EditTaskModal';
import { Task } from '../boards/[boardId]/page';

const fetchMock = jest.spyOn(global, 'fetch');

describe('EditTaskModal', () => {
  const handleClose = jest.fn();
  const handleTaskUpdated = jest.fn();
  const mockStatuses = ['A Fazer', 'Em Progresso'];
  const mockTask: Task = {
    id: 1,
    name: 'Tarefa Original',
    description: 'Descrição original',
    status: 'A Fazer',
    archived: false,
  };

  beforeEach(() => {
    fetchMock.mockClear();
    handleClose.mockClear();
    handleTaskUpdated.mockClear();
    Storage.prototype.getItem = jest.fn(() => 'fake_token');
  });

  it('deve preencher o formulário com os dados da tarefa', () => {
    render(
      <EditTaskModal
        isOpen={true}
        onClose={handleClose}
        onTaskUpdated={handleTaskUpdated}
        task={mockTask}
        statuses={mockStatuses}
      />
    );

    expect(screen.getByLabelText(/Nome da Tarefa/i)).toHaveValue('Tarefa Original');
    expect(screen.getByLabelText(/Descrição/i)).toHaveValue('Descrição original');
    expect(screen.getByLabelText(/Status/i)).toHaveValue('A Fazer');
  });

  it('deve submeter a atualização da tarefa com sucesso', async () => {
    const updatedTask = { ...mockTask, name: 'Tarefa Atualizada' };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(updatedTask),
    } as Response);

    render(
      <EditTaskModal
        isOpen={true}
        onClose={handleClose}
        onTaskUpdated={handleTaskUpdated}
        task={mockTask}
        statuses={mockStatuses}
      />
    );

    const nameInput = screen.getByLabelText(/Nome da Tarefa/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Tarefa Atualizada');
    await userEvent.click(screen.getByRole('button', { name: /Salvar Alterações/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/tasks/1'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ name: 'Tarefa Atualizada', description: 'Descrição original', status: 'A Fazer' }),
      })
    );

    expect(handleTaskUpdated).toHaveBeenCalledWith(updatedTask);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('deve exibir e permitir arquivar a tarefa se o usuário tiver permissão', async () => {
    const archivedTask = { ...mockTask, archived: true };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(archivedTask),
    } as Response);

    render(
      <EditTaskModal
        isOpen={true}
        onClose={handleClose}
        onTaskUpdated={handleTaskUpdated}
        task={mockTask}
        statuses={mockStatuses}
        currentUserPermission="write"
      />
    );

    const archiveButton = screen.getByRole('button', { name: /Arquivar Tarefa/i });
    expect(archiveButton).toBeInTheDocument();
    await userEvent.click(archiveButton);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/tasks/1'),
      expect.objectContaining({ body: JSON.stringify({ archived: true }) })
    );
    expect(handleTaskUpdated).toHaveBeenCalledWith(archivedTask);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});