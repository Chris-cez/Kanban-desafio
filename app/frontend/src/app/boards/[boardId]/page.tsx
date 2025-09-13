'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EditTaskModal from '../../components/EditTaskModal';
import CreateTaskModal from '../../components/CreateTaskModal';
import {
  DndContext,
  DragOverlay,
  DragEndEvent,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Column } from './Column';
import { TaskCard } from './TaskCard';

// Tipos para os dados que virão da API
export interface Task {
  id: number;
  name: string;
  description: string | null;
  status: string;
  archived: boolean;
}

interface Board {
  id: number;
  name: string;
  taskStatuses: string[];
  tasks: Task[];
  currentUserPermission?: 'read' | 'write' | 'admin';
}

export default function BoardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.boardId as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isEditTaskModalOpen, setEditTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Sensores para o Dnd-Kit detectarem o arrastar
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    if (!boardId) return;

    const fetchBoardDetails = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/boards/${boardId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Falha ao buscar os detalhes do quadro.');
        }

        const data: Board = await res.json();
        setBoard(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoardDetails();
  }, [boardId, router]);

  const handleOpenEditModal = (task: Task) => {
    setTaskToEdit(task);
    setEditTaskModalOpen(true);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setBoard((prevBoard) => {
      if (!prevBoard) return null;
      // Se a tarefa foi arquivada, removemos ela da lista.
      if (updatedTask.archived) {
        return { ...prevBoard, tasks: prevBoard.tasks.filter(t => t.id !== updatedTask.id) };
      } else {
        // Caso contrário, apenas atualizamos seus dados.
        const newTasks = prevBoard.tasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        );
        return { ...prevBoard, tasks: newTasks };
      }
    });
  };

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const task = board?.tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    // Limpa a tarefa ativa do overlay
    setActiveTask(null);

    const { active, over } = event;

    if (!over) {
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    // Se soltou no mesmo lugar, não faz nada
    if (activeId === overId) {
      return;
    }

    const activeContainer = active.data.current?.task.status;
    const overContainer = over.data.current?.task?.status || over.id;

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    // Encontra a tarefa que foi movida
    const activeTask = board?.tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    // O novo status é o container de destino
    const newStatus = String(overContainer);

    // 1. Atualização Otimista da UI
    setBoard((prevBoard) => {
      if (!prevBoard) return null;
      const updatedTasks = prevBoard.tasks.map((task) =>
        task.id === active.id ? { ...task, status: String(newStatus) } : task
      );
      return { ...prevBoard, tasks: updatedTasks };
    });

    // 2. Chamada à API para persistir a mudança
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${active.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: String(newStatus) }),
      });
    } catch (error) {
      // Se a API falhar, reverte a mudança na UI e mostra um erro
      setError('Falha ao atualizar a tarefa. Tente novamente.');
      setBoard((prevBoard) => {
        if (!prevBoard) return null;
        const revertedTasks = prevBoard.tasks.map((task) =>
          task.id === active.id ? { ...task, status: activeTask.status } : task
        );
        return { ...prevBoard, tasks: revertedTasks };
      });
    }
  }

  if (isLoading) return <div className="p-8 text-center">Carregando quadro...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Erro: {error}</div>;
  if (!board) return <div className="p-8 text-center">Quadro não encontrado.</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
        onTaskCreated={(newTask) => {
          setBoard((prevBoard) => {
            if (!prevBoard) return null;
            return { ...prevBoard, tasks: [...prevBoard.tasks, newTask] };
          });
        }}
        boardId={board.id}
        statuses={board.taskStatuses}
      />
      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        onClose={() => setEditTaskModalOpen(false)}
        onTaskUpdated={handleTaskUpdated}
        task={taskToEdit}
        statuses={board.taskStatuses}
        currentUserPermission={board.currentUserPermission}
      />
      <header className="flex-shrink-0 bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
          >
            ← Voltar para Quadros
          </button>
          <h1 className="text-2xl font-bold">{board.name}</h1>
        </div>
        <button onClick={() => setCreateTaskModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + Nova Tarefa
        </button>
      </header>
      <DndContext
        sensors={board.currentUserPermission === 'read' ? [] : sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveTask(null)}
        collisionDetection={closestCorners}
      >
        <main className="flex-grow flex gap-6 p-4 overflow-x-auto">
          {board.taskStatuses.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={board.tasks.filter((task) => task.status === status && !task.archived)}
              onTaskDoubleClick={handleOpenEditModal}
            />
          ))}
        </main>
        <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}