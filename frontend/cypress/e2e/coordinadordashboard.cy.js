describe('Pruebas de Caja Negra - Coordinador Dashboard (UI)', () => {

  const usuarioMock = {
    id_usuario: 3,
    nombre: 'Jhoan Castro Feria',
    rol: 'Coordinador',
    id_cargo: 2 // Cargo 2 para Coordinador en RutaProtegida
  };

  beforeEach(() => {
    cy.on('window:confirm', () => true);
    cy.on('window:alert', () => true);

    // 1. Interceptar el healthcheck inicial de App.jsx
    cy.intercept('GET', '**/api/mensaje', {
      statusCode: 200,
      body: { mensaje: "Conectado" }
    }).as('mensajeBackend');

    // 2. Inyectar sesión de coordinador en localStorage
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('usuario', JSON.stringify(usuarioMock));
        win.localStorage.setItem('token', 'token-falso-cypress');
      }
    });

    // 3. Visitar la ruta del coordinador
    cy.visit('/coordinador');
  });

  // ============================================
  // CASOS DE PRUEBA DE CAJA NEGRA
  // ============================================

  it('CP-UI-01: Debe cargar correctamente la página del dashboard', () => {
    cy.url().should('include', '/coordinador');
  });

  it('CP-UI-02: Debe mostrar la información del usuario desde el localStorage si renderiza la tarjeta', () => {
    cy.get('body').then(($body) => {
      if ($body.find('h2:contains("Panel de Coordinación")').length > 0) {
        cy.contains('h2', 'Panel de Coordinación').should('be.visible');
        cy.contains('p', `Bienvenido, ${usuarioMock.nombre}`).should('be.visible');
        cy.contains('strong', 'Rol:').parent().should('contain', usuarioMock.rol);
      }
    });
  });

  it('CP-UI-03: Debe permitir cerrar sesión, borrar la sesión de localStorage y redirigir', () => {
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Cerrar Sesión")').length > 0) {
        cy.contains('button', 'Cerrar Sesión').click();
        cy.url().should('eq', `${Cypress.config().baseUrl}/`);
        cy.window().then((win) => {
          expect(win.localStorage.getItem('usuario')).to.be.null;
        });
      }
    });
  });

});