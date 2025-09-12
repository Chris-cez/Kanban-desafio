'use client';

import { useState } from 'react';

interface DeleteBoardModalProps {
  boardId: number | null;
  onClose: () => void;
  onBoardDeleted: (boardId: number) => void;
}

export default function DeleteBoardModal({ boardId, onClose, onBoardDeleted }: DeleteBoardModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (!boardId) return;

    setIsDeleting(true);
    setError(null);
    const token = localStorage.getItem('access_token');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/boards/${boardId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Falha ao deletar o quadro.');
      }

      onBoardDeleted(boardId);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!boardId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Confirmar Exclusão</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Você tem certeza que deseja deletar este quadro? Todas as tarefas associadas a ele serão perdidas permanentemente.
        </p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="flex justify-center gap-4">
          <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-gray-600 dark:text-gray-300 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700">Cancelar</button>
          <button onClick={handleConfirmDelete} disabled={isDeleting} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400">
            {isDeleting ? 'Deletando...' : 'Deletar'}
          </button>
        </div>
      </div>
    </div>
  );
}