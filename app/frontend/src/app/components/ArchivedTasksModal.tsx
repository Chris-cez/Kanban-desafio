
'use client';

import { useState, useEffect } from 'react';

// Re-utilizando o tipo Task, mas simplificado para o contexto do modal
interface ArchivedTask {
  id: number;
  name: string;
  status: string;
  archived: boolean;
}

interface ArchivedTasksModalProps {
  boardId: number | null;
  onClose: () => void;
}

export default function ArchivedTasksModal({ boardId, onClose }: ArchivedTasksModalProps) {
  const [tasks, setTasks] = useState<ArchivedTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!boardId) return;

    const fetchArchivedTasks = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('access_token');

      try {
        // Este endpoint busca tarefas de um quadro específico que estão arquivadas
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks?boardId=${boardId}&archived=true`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Falha ao buscar tarefas arquivadas.');
        }
        const data = await res.json();
        // Filtra as tarefas no lado do cliente para garantir que apenas as arquivadas sejam exibidas.
        const archivedOnly = data.filter((task: ArchivedTask) => task.archived);
        setTasks(archivedOnly);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArchivedTasks();
  }, [boardId]);

  const handleUnarchive = async (taskId: number) => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ archived: false }), // Define 'archived' como false para devolver ao quadro
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Falha ao desarquivar a tarefa.');
      }

      // Remove a tarefa da lista do modal após o sucesso
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (err: any) {
      alert(`Erro: ${err.message}`); // Exibe um alerta simples em caso de erro
    }
  };

  if (!boardId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">Tarefas Arquivadas</h2>

        <div className="max-h-96 overflow-y-auto">
          {isLoading && <p>Carregando...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!isLoading && tasks.length === 0 && <p className="text-gray-500 dark:text-gray-400">Nenhuma tarefa arquivada neste quadro.</p>}
          
          {!isLoading && tasks.length > 0 && (
            <table className="w-full text-left">
              <thead className="border-b dark:border-gray-600">
                <tr>
                  <th className="p-2 font-semibold">Nome da Tarefa</th>
                  <th className="p-2 font-semibold">Status ao Arquivar</th>
                  <th className="p-2 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b dark:border-gray-700 last:border-b-0">
                    <td className="p-2">{task.name}</td>
                    <td className="p-2 capitalize">{task.status}</td>
                    <td className="p-2 text-right">
                      <button
                        onClick={() => handleUnarchive(task.id)}
                        className="text-sm text-green-500 hover:underline"
                      >
                        Devolver ao quadro
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}