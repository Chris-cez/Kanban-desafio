import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from './TaskCard';
import { Task } from './page';

// Mock do hook useSortable para isolar o componente
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

describe('TaskCard', () => {
  const mockTask: Task = {
    id: 1,
    name: 'Minha Tarefa de Teste',
    description: 'Descrição da tarefa',
    status: 'todo',
    archived: false,
  };

  it('deve renderizar o nome da tarefa corretamente', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Minha Tarefa de Teste')).toBeInTheDocument();
  });

  it('deve chamar a função onDoubleClick ao receber um clique duplo', async () => {
    const handleDoubleClick = jest.fn();
    render(<TaskCard task={mockTask} onDoubleClick={handleDoubleClick} />);

    const cardElement = screen.getByText('Minha Tarefa de Teste');
    await userEvent.dblClick(cardElement);

    expect(handleDoubleClick).toHaveBeenCalledTimes(1);
    expect(handleDoubleClick).toHaveBeenCalledWith(mockTask);
  });

  it('não deve quebrar se onDoubleClick não for fornecido', async () => {
    render(<TaskCard task={mockTask} />);

    const cardElement = screen.getByText('Minha Tarefa de Teste');
    // Simula o clique duplo e espera que nenhuma exceção seja lançada
    await expect(userEvent.dblClick(cardElement)).resolves.not.toThrow();
  });
});