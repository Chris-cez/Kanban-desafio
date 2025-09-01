'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Definindo um tipo para o Board para melhor manutenibilidade
interface Board {
  id: number;
  name: string;
  taskStatuses: string[];
}

export default function DashboardPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBoards = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/boards`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Falha ao buscar os quadros.');
        }

        const data = await res.json();
        setBoards(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoards();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Seus Quadros</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Criar Novo Quadro
        </button>
      </header>
      <main className="p-8">
        {isLoading && <p>Carregando...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {boards.map((board) => (
            <div
              key={board.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onDoubleClick={() => alert(`Navegar para o quadro ${board.id}`)}
            >
              <h2 className="text-xl font-semibold mb-2">{board.name}</h2>
              <div className="flex justify-end gap-2 mt-4">
                <button className="text-sm text-blue-500 hover:underline">Convidar</button>
                <button className="text-sm text-red-500 hover:underline">Deletar</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}