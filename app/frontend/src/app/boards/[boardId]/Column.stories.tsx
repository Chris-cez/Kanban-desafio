import type { Meta, StoryObj } from '@storybook/react';
import { DndContext } from '@dnd-kit/core';
import { Column } from './Column';
import { Task } from './page';

// Mock do TaskCard para isolar o teste da Coluna.
// Não precisamos da funcionalidade de arrastar e soltar aqui.
jest.mock('./TaskCard', () => ({
  TaskCard: ({ task }: { task: Task }) => (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow">
      <p className="font-semibold">{task.name}</p>
    </div>
  ),
}));

// Mock dos hooks do dnd-kit, pois não estamos testando a interação de arrastar.
jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSortable: () => ({
    setNodeRef: jest.fn(),
  }),
}));

const meta: Meta<typeof Column> = {
  title: 'Components/Board/Column',
  component: Column,
  tags: ['autodocs'],
  decorators: [
    // O componente Column espera estar dentro de um DndContext.
    (Story) => (
      <div className="w-80">
        <DndContext>
          <Story />
        </DndContext>
      </div>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onTaskDoubleClick: { action: 'taskDoubleClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof Column>;

const mockTasks: Task[] = [
  { id: 1, name: 'Configurar CI/CD', description: 'Usar GitHub Actions', status: 'todo', archived: false },
  { id: 2, name: 'Desenvolver autenticação', description: 'Implementar JWT', status: 'todo', archived: false },
  { id: 3, name: 'Criar layout do dashboard', description: 'Usar Tailwind CSS', status: 'todo', archived: false },
];

export const Default: Story = {
  name: 'Coluna com Tarefas',
  args: {
    status: 'A Fazer',
    tasks: mockTasks,
  },
};

export const Empty: Story = {
  name: 'Coluna Vazia',
  args: {
    status: 'Concluído',
    tasks: [],
  },
};