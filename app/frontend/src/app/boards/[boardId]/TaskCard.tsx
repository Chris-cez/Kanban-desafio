'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from './page';

interface TaskCardProps {
  task: Task;
  onDoubleClick?: (task: Task) => void;
}

export function TaskCard({ task, onDoubleClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'Task', task }, // Adiciona os dados completos da tarefa
  });

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div onDoubleClick={() => onDoubleClick?.(task)} ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-white dark:bg-gray-800 p-3 rounded-md shadow cursor-grab active:cursor-grabbing">
      <p className="font-semibold">{task.name}</p>
    </div>
  );
}