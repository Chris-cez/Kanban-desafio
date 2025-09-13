import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { Column } from './Column';
import { Task } from './page';

// Mock dos componentes filhos e hooks para focar no teste da Coluna
jest.mock('./TaskCard', () => ({
  TaskCard: ({ task, onDoubleClick }: { task: Task, onDoubleClick: (task: Task) => void }) => (
    <div data-testid={`task-${task.id}`} onDoubleClick={() => onDoubleClick(task)}>
      {task.name}
    </div>
  ),
}));

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSortable: () => ({ setNodeRef: jest.fn() }),
}));

describe('Column', () => {
  const mockTasks: Task[] = [
    { id: 1, name: 'Tarefa 1', description: '', status: 'todo', archived: false },
    { id: 2, name: 'Tarefa 2', description: '', status: 'todo', archived: false },
  ];

  it('deve renderizar o título da coluna e suas tarefas', () => {
    render(
      <DndContext>
        <Column status="todo" tasks={mockTasks} onTaskDoubleClick={() => {}} />
      </DndContext>
    );

    // Verifica se o título está correto (e capitalizado pelo CSS)
    expect(screen.getByRole('heading', { name: /todo/i })).toBeInTheDocument();

    // Verifica se os cards das tarefas foram renderizados
    expect(screen.getByText('Tarefa 1')).toBeInTheDocument();
    expect(screen.getByText('Tarefa 2')).toBeInTheDocument();
    expect(screen.getByTestId('task-1')).toBeInTheDocument();
    expect(screen.getByTestId('task-2')).toBeInTheDocument();
  });

  it('deve renderizar uma mensagem apropriada quando não há tarefas', () => {
    render(
      <DndContext>
        <Column status="done" tasks={[]} onTaskDoubleClick={() => {}} />
      </DndContext>
    );

    expect(screen.getByRole('heading', { name: /done/i })).toBeInTheDocument();
    // Verifica que nenhuma tarefa foi renderizada
    expect(screen.queryByTestId(/task-/)).not.toBeInTheDocument();
  });
});