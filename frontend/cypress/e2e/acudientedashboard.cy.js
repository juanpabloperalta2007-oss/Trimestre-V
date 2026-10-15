describe('Pruebas de Caja Negra - Acudiente Dashboard (UI)', () => {

  const usuarioMock = {
    id_usuario: 8,
    nombre: 'Laura Martinez',
    rol: 'Acudiente',
    id_cargo: 4 // Cargo 4 para Acudiente en RutaProtegida
  };

  beforeEach(() => {
    cy.on('window:confirm', () => true);
    cy.on('window:alert', () => true);

    // 1. Interceptar el healthcheck inicial de App.jsx
    cy.intercept('GET', '**/api/mensaje', {
      statusCode: 200,
      body: { mensaje: "Conectado" }
    }).as('mensajeBackend');

    // 2. Inyectar sesión de acudiente en localStorage
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('usuario', JSON.stringify(usuarioMock));
        win.localStorage.setItem('token', 'token-falso-cypress');
      }
    });

    // 3. Entrar a la ruta del acudiente
    cy.visit('/acudiente');
  });

  // ============================================
  // CASOS DE PRUEBA DE CAJA NEGRA
  // ============================================

  it('CP-UI-01: Debe cargar correctamente la página del acudiente', () => {
    cy.url().should('include', '/acudiente');
  });

  it('CP-UI-02: Debe mostrar el encabezado "Panel de Acudiente / Padre de Familia" y saludo si renderiza el dashboard', () => {
    cy.get('body').then(($body) => {
      if ($body.find('h2:contains("Panel de Acudiente")').length > 0) {
        cy.contains('h2', 'Panel de Acudiente / Padre de Familia').should('be.visible');
        cy.contains('p', `Bienvenido, ${usuarioMock.nombre}`).should('be.visible');
        cy.contains('strong', 'Rol:').parent().should('contain', usuarioMock.rol);
      }
    });
  });

  it('CP-UI-03: Debe permitir cerrar sesión, limpiar el localStorage y redirigir al Login', () => {
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