describe('Pruebas de Caja Negra - Reportes (UI)', () => {

  beforeEach(() => {
    cy.on('window:confirm', () => true);
    cy.on('window:alert', () => true);

    // 1. Interceptar el healthcheck inicial de App.jsx para evitar errores HTTP
    cy.intercept('GET', '**/api/mensaje', {
      statusCode: 200,
      body: { mensaje: "Conectado" }
    }).as('mensajeBackend');

    // 2. Interceptar las peticiones del backend del módulo Reportes
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

    cy.intercept('GET', '**/api/reportes/resumen', {
      statusCode: 200,
      body: {
        total: 10,
        presentes: 8,
        ausentes: 2
      }
    }).as('getResumen');

    // 3. Inyectar la sesión requerida por <RutaProtegida cargoPermitido={3}> en localStorage
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          'usuario',
          JSON.stringify({
            id_usuario: 6,
            nombre: 'Jorge Salgado',
            id_cargo: 3 // 👈 CARGO 3 REQUERIDO PARA DOCENTES
          })
        );
        win.localStorage.setItem('token', 'token-falso-cypress');
      }
    });

    // 4. Navegar directamente a la ruta protegida
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

  it('CP-UI-03: Debe verificar la carga de la tabla desde el backend (GET /api/reportes)', () => {
    cy.wait('@getReportes').its('response.statusCode').should('eq', 200);
    cy.get('table').should('exist');
  });

  it('CP-UI-04: Debe verificar la carga del resumen estadístico (GET /api/reportes/resumen)', () => {
    cy.wait('@getResumen').its('response.statusCode').should('eq', 200);
  });

  it('CP-UI-05: Debe permitir interactuar con los elementos de la vista si existen', () => {
    cy.get('body').then(($body) => {
      if ($body.find('input, button').length > 0) {
        cy.get('input, button').first().should('be.visible');
      }
    });
  });

});