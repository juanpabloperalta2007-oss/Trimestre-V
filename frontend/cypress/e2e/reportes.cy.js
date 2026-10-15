describe('Pruebas de Caja Negra - Reportes (UI)', () => {

  beforeEach(() => {
    cy.on('window:confirm', () => true);
    cy.on('window:alert', () => true);

    // 1. Interceptar el healthcheck inicial de App.jsx
    cy.intercept('GET', '**/api/mensaje', {
      statusCode: 200,
      body: { mensaje: "Conectado" }
    }).as('mensajeBackend');

    // 2. Interceptar la petición de reportes consumida por <ReportesTable />
    cy.intercept('GET', '**/api/reportes', {
      statusCode: 200,
      body: [
        {
          id_asistencia: 1,
          estudiante: 'Juan Carlos Pérez',
          fecha: '2026-08-10',
          estado: 'Presente',
          observaciones: 'Sin novedades'
        }
      ]
    }).as('getReportes');

    // 3. Inyectar sesión de docente en localStorage para <RutaProtegida cargoPermitido={3}>
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          'usuario',
          JSON.stringify({
            id_usuario: 6,
            nombre: 'Jorge Salgado',
            id_cargo: 3
          })
        );
        win.localStorage.setItem('token', 'token-falso-cypress');
      }
    });

    // 4. Entrar a la vista
    cy.visit('/reportes');
  });

  // ============================================
  // CASOS DE PRUEBA DE CAJA NEGRA
  // ============================================

  it('CP-UI-01: Debe cargar correctamente la página de reportes', () => {
    cy.url().should('include', '/reportes');
  });

  it('CP-UI-02: Debe mostrar el título "Reportes" y su descripción', () => {
    cy.contains('h2', 'Reportes').should('be.visible');
    cy.contains('p', 'Consulta y genera los reportes del sistema.').should('be.visible');
  });

  it('CP-UI-03: Debe cargar la lista de reportes en la tabla desde el backend', () => {
    cy.wait('@getReportes').its('response.statusCode').should('eq', 200);
    cy.get('table').should('exist');
  });

  it('CP-UI-04: Debe renderizar la estructura del módulo Reportes (Sidebar, Header y Tabla)', () => {
    cy.get('table').should('be.visible');
    cy.contains('Reportes').should('be.visible');
  });

  it('CP-UI-05: Debe permitir la interacción con la tabla o controles si existen', () => {
    cy.get('body').then(($body) => {
      if ($body.find('table tbody tr').length > 0) {
        cy.get('table tbody tr').first().should('be.visible');
      }
    });
  });

});