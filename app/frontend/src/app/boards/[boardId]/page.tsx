'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CreateTaskModal from '../../components/CreateTaskModal';

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
}

export default function BoardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.boardId as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateTaskModalOpen, setCreateTaskModalOpen] = useState(false);

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
      <header className="flex-shrink-0 bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{board.name}</h1>
        <button onClick={() => setCreateTaskModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + Nova Tarefa
        </button>
      </header>
      <main className="flex-grow flex gap-6 p-4 overflow-x-auto">
        {board.taskStatuses.map((status) => (
          <div key={status} className="flex-shrink-0 w-80 bg-gray-200 dark:bg-gray-700 rounded-lg p-3">
            <h2 className="font-bold mb-4 text-lg capitalize">{status}</h2>
            <div className="space-y-3">
              {board.tasks
                .filter((task) => task.status === status && !task.archived)
                .map((task) => (
                  <div key={task.id} className="bg-white dark:bg-gray-800 p-3 rounded-md shadow cursor-pointer">
                    <p className="font-semibold">{task.name}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}