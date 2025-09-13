'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Task } from '../boards/[boardId]/page';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: (updatedTask: Task) => void;
  task: Task | null;
  statuses: string[];
  currentUserPermission?: 'read' | 'write' | 'admin';
}

export default function EditTaskModal({ isOpen, onClose, onTaskUpdated, task, statuses, currentUserPermission }: EditTaskModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false); // Novo estado para arquivamento

  useEffect(() => {
    // Preenche o formulário quando uma tarefa é selecionada
    if (task) {
      setName(task.name);
      setDescription(task.description || '');
      setStatus(task.status);
    }
  }, [task]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!task) return;

    setError(null);
    setIsSubmitting(true);

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Você não está autenticado.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, description, status }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Falha ao atualizar a tarefa.');
      }

      const updatedTask = await res.json();
      onTaskUpdated(updatedTask);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveTask = async () => {
    if (!task) return;

    setIsArchiving(true);
    setError(null);

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Você não está autenticado.');
      setIsArchiving(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ archived: true }), // Envia a flag de arquivamento
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Falha ao arquivar a tarefa.');
      }
      const archivedTask = await res.json();
      onTaskUpdated(archivedTask); // Isso fará com que a tarefa seja removida da UI do quadro
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsArchiving(false);
    }
  };

  if (!isOpen || !task) return null;

  const canArchive = currentUserPermission === 'write' || currentUserPermission === 'admin';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Editar Tarefa</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4"><label htmlFor="editTaskName" className="block mb-2 text-sm font-medium">Nome da Tarefa</label><input id="editTaskName" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white" /></div>
          <div className="mb-4"><label htmlFor="editTaskDescription" className="block mb-2 text-sm font-medium">Descrição (Opcional)</label><textarea id="editTaskDescription" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white" /></div>
          <div className="mb-6"><label htmlFor="editTaskStatus" className="block mb-2 text-sm font-medium">Status</label><select id="editTaskStatus" value={status} onChange={(e) => setStatus(e.target.value)} required className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white">{statuses.map((s) => (<option key={s} value={s} className="capitalize">{s}</option>))}</select></div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-end gap-4 mt-6">
            {canArchive && (
              <button
                type="button"
                onClick={handleArchiveTask}
                disabled={isSubmitting || isArchiving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400"
              >
                {isArchiving ? 'Arquivando...' : 'Arquivar Tarefa'}
              </button>
            )}
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700">Cancelar</button>
            <button type="submit" disabled={isSubmitting || isArchiving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400">{isSubmitting ? 'Salvando...' : 'Salvar Alterações'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}