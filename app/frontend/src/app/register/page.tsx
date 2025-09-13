'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Etapa 1: Registrar o usuário
      const registerApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/register`;
      const registerRes = await fetch(registerApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });

      if (!registerRes.ok) {
        const errorData = await registerRes.json();
        throw new Error(errorData.message || 'Falha ao registrar');
      }

      // Etapa 2: Fazer o login automaticamente após o registro
      const loginApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`;
      const loginRes = await fetch(loginApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });

      if (!loginRes.ok) {
        // Se o login falhar após um registro bem-sucedido, é uma situação inesperada.
        // O melhor a fazer é redirecionar para a página de login para uma tentativa manual.
        alert('Registro realizado com sucesso! Redirecionando para o login.');
        router.push('/login');
        return;
      }

      const loginData = await loginRes.json();

      // Etapa 3: Armazenar o token e redirecionar para o dashboard
      localStorage.setItem('access_token', loginData.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Crie sua conta
        </h1>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="login"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Login
            </label>
            <input
              id="login"
              name="login"
              type="text"
              required
              className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="seu-usuario"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full px-5 py-3 text-base font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Cadastrar
          </button>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-500">
              Faça login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}