describe('Pruebas de Caja Negra - Inicio Docente (UI)', () => {

  const usuarioMock = {
    id_usuario: 6,
    nombre: 'Jorge Salgado',
    id_cargo: 3 // Cargo 3 para Docente en RutaProtegida
  };

  beforeEach(() => {
    cy.on('window:confirm', () => true);
    cy.on('window:alert', () => true);

    // 1. Interceptar el healthcheck inicial de App.jsx
    cy.intercept('GET', '**/api/mensaje', {
      statusCode: 200,
      body: { mensaje: "Conectado" }
    }).as('mensajeBackend');

    // 2. Interceptar la llamada a notificaciones que realiza BuzonCard
    cy.intercept('GET', '**/api/notificaciones*', {
      statusCode: 200,
      body: [
        {
          id_notificacion: 1,
          asunto: 'Inasistencia registrada',
          mensaje: 'Se registró una novedad de asistencia.',
          fecha: '2026-10-15'
        }
      ]
    }).as('getNotificaciones');

    // 3. Inyectar sesión en localStorage antes de cargar el componente
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('usuario', JSON.stringify(usuarioMock));
        win.localStorage.setItem('token', 'token-falso-cypress');
      }
    });

    // 4. Navegar a la ruta del docente
    cy.visit('/docente');
  });

  // ============================================
  // CASOS DE PRUEBA DE CAJA NEGRA
  // ============================================

  it('CP-UI-01: Debe cargar correctamente la URL de inicio del docente (/docente)', () => {
    cy.url().should('include', '/docente');
  });

  it('CP-UI-02: Debe desplegar el título "Inicio" y la fecha actual', () => {
    cy.contains('h2', 'Inicio').should('be.visible');
    cy.contains('strong', 'Hoy:').should('be.visible');
  });

  it('CP-UI-03: Debe verificar que el botón de "Agenda" sea visible', () => {
    cy.contains('button', 'Agenda').should('be.visible');
  });

  it('CP-UI-04: Debe realizar la petición para consultar notificaciones en el buzón (GET /api/notificaciones)', () => {
    cy.wait('@getNotificaciones').its('response.statusCode').should('eq', 200);
  });

  it('CP-UI-05: Debe verificar la presencia del menú lateral (SidebarDocen) y encabezado (Header)', () => {
    cy.get('body').should('be.visible');
    cy.get('.col-md-9, .col-lg-10').should('exist');
  });

});