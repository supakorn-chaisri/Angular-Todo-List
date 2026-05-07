describe('Todo Application', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the login page initially', () => {
    cy.url().should('include', '/auth/login');
    cy.get('h1').should('contain', 'Welcome Back');
  });

  it('should navigate to register page', () => {
    cy.contains('Create an account').click();
    cy.url().should('include', '/auth/register');
  });
});
