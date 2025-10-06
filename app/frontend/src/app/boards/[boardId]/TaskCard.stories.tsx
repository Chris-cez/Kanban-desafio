import type { Meta, StoryObj } from '@storybook/react';
import { TaskCard } from './TaskCard';
import { Task } from './page';

// Informações gerais sobre o componente
const meta: Meta<typeof TaskCard> = {
  title: 'Components/Board/TaskCard', // Como ele aparecerá na barra lateral do Storybook
  component: TaskCard,
  tags: ['autodocs'], // Habilita a documentação automática
  argTypes: {
    // Você pode customizar como as props são controladas
    onDoubleClick: { action: 'doubleClicked' }, // Loga uma ação no Storybook quando a prop é chamada
  },
};

export default meta;
type Story = StoryObj<typeof TaskCard>;

// --- Dados Mock ---
const baseTask: Task = {
  id: 1,
  name: 'Implementar autenticação JWT',
  description: 'Usar a biblioteca passport.js no backend.',
  status: 'doing',
  archived: false,
};

// --- Histórias ---

// 1. Uma história para o estado padrão do card
export const Default: Story = {
  args: {
    task: baseTask,
  },
};

// 2. Uma história para um card com nome muito longo
export const WithLongName: Story = {
  args: {
    task: { ...baseTask, id: 2, name: 'Refatorar todo o sistema de gerenciamento de estado global para usar uma abordagem mais moderna e escalável' },
  },
};
