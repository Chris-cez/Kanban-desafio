import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './page';

// Mock de dependências externas
const mockRouter = {
  push: jest.fn(),
};
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  // Link é mockado automaticamente pelo Next.js/Jest
}));

const fetchMock = jest.spyOn(global, 'fetch');

describe('LoginPage', () => {
  beforeEach(() => {
    fetchMock.mockClear();
    mockRouter.push.mockClear();
    // Mock do localStorage
    Storage.prototype.setItem = jest.fn();
  });

  it('deve renderizar o formulário de login corretamente', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /Acesse sua conta/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
  });

  it('deve permitir que o usuário digite nos campos', async () => {
    render(<LoginPage />);
    const loginInput = screen.getByLabelText(/Login/i);
    const passwordInput = screen.getByLabelText(/Senha/i);

    await userEvent.type(loginInput, 'testuser');
    await userEvent.type(passwordInput, 'password123');

    expect(loginInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('password123');
  });

  it('deve fazer login com sucesso e redirecionar para o dashboard', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ access_token: 'fake_token' }),
    } as Response);

    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/Login/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/Senha/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /Entrar/i }));

    // Verifica se a API foi chamada com os dados corretos
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ login: 'testuser', password: 'password123' }),
      })
    );

    // Verifica se o token foi salvo e o usuário foi redirecionado
    expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'fake_token');
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
  });

  it('deve exibir uma mensagem de erro em caso de falha no login', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Credenciais inválidas' }),
    } as Response);

    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/Login/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/Senha/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /Entrar/i }));

    expect(await screen.findByText('Credenciais inválidas')).toBeInTheDocument();
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});