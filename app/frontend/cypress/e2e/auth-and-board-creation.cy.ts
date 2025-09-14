/// <reference types="cypress" />

describe('Fluxo de Autenticação e Criação de Quadro', () => {
  // Usaremos um login único para cada execução de teste para evitar conflitos
  const userLogin = `testuser_${Date.now()}`;
  const userPassword = 'password123';

  it('deve permitir que um usuário se registre, crie um quadro e o veja no dashboard', () => {
    // --- Etapa 1: Interceptar chamadas de API para controlar as respostas ---

    // Mock para o registro bem-sucedido
    cy.intercept('POST', '**/users/register', {
      statusCode: 201,
      body: { id: 1, login: userLogin },
    }).as('registerRequest');

    // Mock para o login automático após o registro
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: { access_token: 'fake_jwt_token' },
    }).as('loginRequest');

    // Mock para a busca de quadros (inicialmente vazia)
    cy.intercept('GET', '**/boards', {
      statusCode: 200,
      body: [],
    }).as('getBoards');

    // --- Etapa 2: Registro ---
    cy.visit('/register');

    cy.get('input[name="login"]').type(userLogin);
    cy.get('input[name="password"]').type(userPassword);
    cy.get('button[type="submit"]').click();

    // Aguarda as chamadas de API terminarem
    cy.wait('@registerRequest');
    cy.wait('@loginRequest');

    // --- Etapa 3: Dashboard e Criação do Quadro ---

    // Verifica se foi redirecionado para o dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('h1', 'Seus Quadros').should('be.visible');

    // Aguarda a busca de quadros e verifica a mensagem de "sem quadros"
    cy.wait('@getBoards');
    cy.contains('Você ainda não tem quadros. Crie um para começar!').should('be.visible');

    // Mock para a criação do novo quadro
    const newBoard = { id: 1, name: 'Meu Primeiro Quadro Cypress', taskStatuses: ['A Fazer'] };
    cy.intercept('POST', '**/boards', {
      statusCode: 201,
      body: newBoard,
    }).as('createBoard');

    // Abre o modal de criação
    cy.contains('button', 'Criar Novo Quadro').click();

    // Preenche o formulário do modal
    cy.get('input#boardName').type(newBoard.name);
    cy.get('input#boardStatuses').clear().type('A Fazer');
    
    // Mock para a busca de quadros após a criação
    cy.intercept('GET', '**/boards', {
      statusCode: 200,
      body: [newBoard],
    }).as('getBoardsAfterCreate');

    // Clica para criar o quadro
    cy.contains('button', 'Criar Quadro').click();

    // Aguarda a criação e verifica se o modal fechou
    cy.wait('@createBoard');
    cy.get('h2').contains('Criar Novo Quadro').should('not.exist');

    // --- Etapa 4: Verificação ---

    // O componente de dashboard refaz o fetch, então esperamos a nova chamada
    // e verificamos se o novo quadro está visível na tela.
    cy.contains('h2', newBoard.name).should('be.visible');
  });
});
