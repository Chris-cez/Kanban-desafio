describe('Fluxo de Integração Completo (Full Stack)', () => {
  beforeEach(() => {
    // Antes de cada teste, chamamos nossa tarefa para limpar o banco de dados.
    // Isso garante que cada teste comece com um estado limpo e seja independente.
    cy.task('db:reset');
  });

  it('deve registrar um usuário, criar um quadro e vê-lo no dashboard', () => {
    const userLogin = `realuser_${Date.now()}`;
    const userPassword = 'password123';
    const boardName = 'Meu Quadro Real';

    // --- Etapa 1: Registro ---
    // Visita a página de registro
    cy.visit('/register');

    // Preenche o formulário e envia. A requisição vai para o backend de verdade.
    cy.get('input[name="login"]').type(userLogin);
    cy.get('input[name="password"]').type(userPassword);
    cy.get('button[type="submit"]').click();

    // --- Etapa 2: Dashboard ---
    // O backend deve logar e redirecionar. Verificamos se chegamos ao dashboard.
    cy.url().should('include', '/dashboard');
    cy.contains('h1', 'Seus Quadros').should('be.visible');

    // Como o banco está limpo, a mensagem de "sem quadros" deve aparecer.
    cy.contains('Você ainda não tem quadros. Crie um para começar!').should('be.visible');

    // --- Etapa 3: Criação do Quadro ---
    // Abre o modal de criação
    cy.contains('button', 'Criar Novo Quadro').click();

    // Preenche o formulário e cria o quadro. A requisição POST /boards é real.
    cy.get('input#boardName').type(boardName);
    cy.get('input#boardStatuses').clear().type('A Fazer, Feito');
    cy.contains('button', 'Criar Quadro').click();

    // --- Etapa 4: Verificação ---
    // O dashboard busca os quadros novamente. Verificamos se o novo quadro aparece na tela.
    cy.contains('h2', boardName).should('be.visible');
  });
});
