'use client';

import { useState, FormEvent, useEffect } from 'react';

interface Task {
  id: number;
  name: string;
  description: string | null;
  status: string;
  archived: boolean;
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (newTask: Task) => void;
  boardId: number;
  statuses: string[];
}

export default function CreateTaskModal({ isOpen, onClose, onTaskCreated, boardId, statuses }: CreateTaskModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(statuses[0] || '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Garante que o status inicial seja sempre válido quando o modal for aberto
    if (isOpen) {
      setStatus(statuses[0] || '');
    }
  }, [isOpen, statuses]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Você não está autenticado.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, description, status, boardId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Falha ao criar a tarefa.');
      }

      const newTask = await res.json();
      onTaskCreated(newTask);
      onClose();
      setName('');
      setDescription('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Criar Nova Tarefa</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4"><label htmlFor="taskName" className="block mb-2 text-sm font-medium">Nome da Tarefa</label><input id="taskName" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white" /></div>
          <div className="mb-4"><label htmlFor="taskDescription" className="block mb-2 text-sm font-medium">Descrição (Opcional)</label><textarea id="taskDescription" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white" /></div>
          <div className="mb-6"><label htmlFor="taskStatus" className="block mb-2 text-sm font-medium">Status Inicial</label><select id="taskStatus" value={status} onChange={(e) => setStatus(e.target.value)} required className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white">{statuses.map((s) => (<option key={s} value={s} className="capitalize">{s}</option>))}</select></div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-end gap-4"><button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700">Cancelar</button><button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400">{isSubmitting ? 'Criando...' : 'Criar Tarefa'}</button></div>
        </form>
      </div>
    </div>
  );
}
