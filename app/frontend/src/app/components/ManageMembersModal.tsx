'use client';

import { useState, useEffect, FormEvent } from 'react';

interface User {
  id: number;
  login: string;
}

interface BoardMember {
  id: number;
  permissions: 'read' | 'write' | 'admin';
  user: User;
}

interface ManageMembersModalProps {
  boardId: number | null;
  onClose: () => void;
}

export default function ManageMembersModal({ boardId, onClose }: ManageMembersModalProps) {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for adding a new member
  const [newUserLogin, setNewUserLogin] = useState('');
  const [newPermission, setNewPermission] = useState<'read' | 'write' | 'admin'>('read');

  useEffect(() => {
    if (!boardId) return;

    const fetchMembers = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('access_token');

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/board-members?boardId=${boardId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Falha ao buscar membros.');
        const data = await res.json();
        setMembers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [boardId]);

  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault();
    if (!boardId) return;

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/board-members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          boardId,
          userLogin: newUserLogin,
          permissions: newPermission,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Falha ao adicionar membro.');
      }

      const newMember = await res.json();
      setMembers((prev) => [...prev, newMember]);
      setNewUserLogin('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm('Tem certeza que deseja remover este membro?')) return;

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/board-members/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Falha ao remover membro.');
      }

      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!boardId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Gerenciar Membros</h2>

        {/* Add Member Form */}
        <form onSubmit={handleAddMember} className="flex gap-2 mb-6">
          <input type="text" placeholder="Login do usuário" value={newUserLogin} onChange={(e) => setNewUserLogin(e.target.value)} required className="flex-grow px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white" />
          <select value={newPermission} onChange={(e) => setNewPermission(e.target.value as any)} className="px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white">
            <option value="read">Leitura</option>
            <option value="write">Escrita</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Adicionar</button>
        </form>

        {/* Members List */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {isLoading && <p>Carregando membros...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {members.map((member) => (
            <div key={member.id} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
              <div>
                <p className="font-semibold">{member.user.login}</p>
                <p className="text-sm text-gray-500">{member.permissions}</p>
              </div>
              <button onClick={() => handleRemoveMember(member.id)} className="text-red-500 hover:text-red-700 text-sm">Remover</button>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700">Fechar</button>
        </div>
      </div>
    </div>
  );
}
