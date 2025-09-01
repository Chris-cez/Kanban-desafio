import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <main className="flex flex-col gap-8 items-center text-center">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
          Bem-vindo ao Kanban
        </h1>
        <p className="text-lg text-foreground/80">
          Organize suas tarefas de forma simples e eficiente.
        </p>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            href="/login"
            className="rounded-full bg-foreground text-background hover:bg-foreground/80 font-medium h-12 px-8 flex items-center justify-center"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] hover:bg-black/[.05] dark:hover:bg-white/[.06] font-medium h-12 px-8 flex items-center justify-center"
          >
            Cadastre-se
          </Link>
        </div>
      </main>
    </div>
  );
}
