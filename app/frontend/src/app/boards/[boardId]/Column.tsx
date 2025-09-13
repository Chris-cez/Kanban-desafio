'use client';

import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { Task } from './page';
import { TaskCard } from './TaskCard';

interface ColumnProps {
  status: string;
  tasks: Task[];
  onTaskDoubleClick: (task: Task) => void;
}

export function Column({ status, tasks, onTaskDoubleClick }: ColumnProps) {
  const { setNodeRef } = useSortable({ id: status });

  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-80 bg-gray-200 dark:bg-gray-700 rounded-lg p-3">
      <h2 className="font-bold mb-4 text-lg capitalize">{status}</h2>
      <SortableContext items={tasks.map(t => t.id)}>
        <div className="space-y-3">{tasks.map((task) => <TaskCard key={task.id} task={task} onDoubleClick={onTaskDoubleClick} />)}</div>
      </SortableContext>
    </div>
  );
}