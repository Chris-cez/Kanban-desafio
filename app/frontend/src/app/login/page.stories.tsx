import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { userEvent, within, expect } from '@storybook/test';
import LoginPage from './page';

// Mock de dependências externas
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const meta: Meta<typeof LoginPage> = {
  title: 'Pages/Login',
  component: LoginPage,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      router: {
        pathname: '/login',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoginPage>;

export const Default: Story = {
  name: 'Visão Padrão',
};

export const Success: Story = {
  name: 'Login com Sucesso',
  parameters: {
    msw: {
      handlers: [
        http.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, () => {
          return HttpResponse.json({ access_token: 'fake-jwt-token' });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/Login/i), 'testuser');
    await userEvent.type(canvas.getByLabelText(/Senha/i), 'password123');
    await userEvent.click(canvas.getByRole('button', { name: /Entrar/i }));
  },
};

export const InvalidCredentials: Story = {
  name: 'Erro: Credenciais Inválidas',
  parameters: {
    msw: {
      handlers: [
        http.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, () => {
          return HttpResponse.json({ message: 'Credenciais inválidas' }, { status: 401 });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/Login/i), 'wronguser');
    await userEvent.type(canvas.getByLabelText(/Senha/i), 'wrongpassword');
    await userEvent.click(canvas.getByRole('button', { name: /Entrar/i }));
    await expect(canvas.getByText('Credenciais inválidas')).toBeInTheDocument();
  },
};