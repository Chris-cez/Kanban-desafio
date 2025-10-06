import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { userEvent, within, expect } from '@storybook/test';
import RegisterPage from './page';

// Mock de dependências externas
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const meta: Meta<typeof RegisterPage> = {
  title: 'Pages/Register',
  component: RegisterPage,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      router: {
        pathname: '/register',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RegisterPage>;

export const Default: Story = {
  name: 'Visão Padrão',
};

export const Success: Story = {
  name: 'Registro com Sucesso',
  parameters: {
    msw: {
      handlers: [
        http.post(`${process.env.NEXT_PUBLIC_API_URL}/users/register`, () => {
          return HttpResponse.json({ id: 1, login: 'newuser' }, { status: 201 });
        }),
        http.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, () => {
          return HttpResponse.json({ access_token: 'fake-jwt-token' });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/Login/i), 'newuser');
    await userEvent.type(canvas.getByLabelText(/Senha/i), 'newpassword123');
    await userEvent.click(canvas.getByRole('button', { name: /Cadastrar/i }));
  },
};

export const UserAlreadyExists: Story = {
  name: 'Erro: Usuário já existe',
  parameters: {
    msw: {
      handlers: [
        http.post(`${process.env.NEXT_PUBLIC_API_URL}/users/register`, () => {
          return HttpResponse.json({ message: 'Usuário com este login já existe' }, { status: 409 });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/Login/i), 'existinguser');
    await userEvent.type(canvas.getByLabelText(/Senha/i), 'password123');
    await userEvent.click(canvas.getByRole('button', { name: /Cadastrar/i }));
    await expect(canvas.getByText('Usuário com este login já existe')).toBeInTheDocument();
  },
};