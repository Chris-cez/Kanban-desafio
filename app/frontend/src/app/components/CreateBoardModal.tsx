'use client';

import { useState, FormEvent } from 'react';

interface Board {
  id: number;
  name: string;
  taskStatuses: string[];
}

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBoardCreated: (newBoard: Board) => void;
}

export default function CreateBoardModal({ isOpen, onClose, onBoardCreated }: CreateBoardModalProps) {
  const [name, setName] = useState('');
  const [statuses, setStatuses] = useState('todo,doing,done');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/boards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          taskStatuses: statuses.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Falha ao criar o quadro.');
      }

      const newBoard = await res.json();
      onBoardCreated(newBoard);
      onClose();
      // Resetar o estado do formulário para a próxima vez que o modal for aberto
      setName('');
      setStatuses('todo,doing,done');
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
        <h2 className="text-2xl font-bold mb-4">Criar Novo Quadro</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="boardName" className="block mb-2 text-sm font-medium">Nome do Quadro</label>
            <input id="boardName" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="mb-6">
            <label htmlFor="boardStatuses" className="block mb-2 text-sm font-medium">Status das Tarefas (separados por vírgula)</label>
            <input id="boardStatuses" type="text" value={statuses} onChange={(e) => setStatuses(e.target.value)} required className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white" />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
              {isSubmitting ? 'Criando...' : 'Criar Quadro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
