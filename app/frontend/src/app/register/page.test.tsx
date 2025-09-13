import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from './page';

// Mock de dependências externas
const mockRouter = {
  push: jest.fn(),
};
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

const fetchMock = jest.spyOn(global, 'fetch');

describe('RegisterPage', () => {
  beforeEach(() => {
    fetchMock.mockClear();
    mockRouter.push.mockClear();
    Storage.prototype.setItem = jest.fn();
    global.alert = jest.fn();
  });

  it('deve renderizar o formulário de registro corretamente', () => {
    render(<RegisterPage />);
    expect(screen.getByRole('heading', { name: /Crie sua conta/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cadastrar/i })).toBeInTheDocument();
  });

  it('deve registrar com sucesso, fazer login e redirecionar para o dashboard', async () => {
    // Mock da chamada de registro
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 1, login: 'newuser' }),
    } as Response);

    // Mock da chamada de login automático
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ access_token: 'new_fake_token' }),
    } as Response);

    render(<RegisterPage />);

    await userEvent.type(screen.getByLabelText(/Login/i), 'newuser');
    await userEvent.type(screen.getByLabelText(/Senha/i), 'newpassword123');
    await userEvent.click(screen.getByRole('button', { name: /Cadastrar/i }));

    // Verifica a chamada de registro
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/users/register'),
      expect.objectContaining({
        body: JSON.stringify({ login: 'newuser', password: 'newpassword123' }),
      })
    );

    // Verifica a chamada de login
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        body: JSON.stringify({ login: 'newuser', password: 'newpassword123' }),
      })
    );

    // Verifica o resultado final
    expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'new_fake_token');
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
  });

  it('deve exibir uma mensagem de erro se o registro falhar', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Usuário já existe' }),
    } as Response);

    render(<RegisterPage />);

    await userEvent.type(screen.getByLabelText(/Login/i), 'existinguser');
    await userEvent.type(screen.getByLabelText(/Senha/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /Cadastrar/i }));

    expect(await screen.findByText('Usuário já existe')).toBeInTheDocument();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('deve redirecionar para o login se o login automático falhar após o registro', async () => {
    // Registro OK
    fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) } as Response);
    // Login falha
    fetchMock.mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({}) } as Response);

    render(<RegisterPage />);
    await userEvent.type(screen.getByLabelText(/Login/i), 'test');
    await userEvent.type(screen.getByLabelText(/Senha/i), 'password');
    await userEvent.click(screen.getByRole('button', { name: /Cadastrar/i }));

    await screen.findByRole('button', { name: /Cadastrar/i }); // Espera a promise resolver
    expect(global.alert).toHaveBeenCalledWith('Registro realizado com sucesso! Redirecionando para o login.');
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });
});