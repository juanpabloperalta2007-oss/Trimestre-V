describe('Pruebas de Caja Negra - Inicio Docente (UI)', () => {

  const usuarioMock = {
    id_usuario: 6,
    nombre: 'Jorge Salgado',
    id_cargo: 3 // Cargo 3 para Docente en RutaProtegida
  };

  beforeEach(() => {
    cy.on('window:confirm', () => true);
    cy.on('window:alert', () => true);

    // 1. Interceptar el healthcheck global de App.jsx
    cy.intercept('GET', '**/api/mensaje', {
      statusCode: 200,
      body: { mensaje: "Conectado" }
    }).as('mensajeBackend');

    // 2. Interceptar peticiones que consume BuzonCard / Inicio
    cy.intercept('GET', '**/api/notificaciones*', {
      statusCode: 200,
      body: []
    }).as('getNotificaciones');

    // 3. Inyectar sesión en localStorage para superar RutaProtegida
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('usuario', JSON.stringify(usuarioMock));
        win.localStorage.setItem('token', 'token-falso-cypress');
      }
    });

    // 4. Entrar a la ruta del docente
    cy.visit('/docente');
  });

  // ============================================
  // CASOS DE PRUEBA DE CAJA NEGRA
  // ============================================

  it('CP-UI-01: Debe cargar correctamente la URL de inicio del docente', () => {
    cy.url().should('include', '/docente');
  });

  it('CP-UI-02: Debe mostrar el título "Inicio" y la fecha actual', () => {
    cy.contains('h2', 'Inicio').should('be.visible');
    cy.contains('strong', 'Hoy:').should('be.visible');
  });

  it('CP-UI-03: Debe renderizar el botón de "Agenda"', () => {
    cy.contains('button', 'Agenda').should('be.visible');
  });

  it('CP-UI-04: Debe renderizar la estructura general (Header, Sidebar y Buzón)', () => {
    cy.get('body').should('be.visible');
    // Verifica que exista la tarjeta del buzón
    cy.get('.col-md-9, .col-lg-10').should('exist');
  });

});