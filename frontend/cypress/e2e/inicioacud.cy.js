describe('Pruebas de Caja Negra - Inicio Acudiente (UI)', () => {

  const usuarioMock = {
    id_usuario: 8,
    id_acudiente: 8,
    nombre: 'Laura Martinez',
    id_cargo: 4 // Cargo 4 para Acudiente en RutaProtegida
  };

  const notificacionesMock = [
    {
      id_correo: 101,
      asunto: 'Citación a reunión de padres',
      remitente_nombre: 'Carlos Rodríguez',
      rol: 'Docente',
      mensaje: 'Estimado acudiente, se le cita a reunión el próximo viernes a las 8:00 AM.',
      tipo_notificacion: 'Citación',
      fecha_envio: '2026-10-10T10:00:00.000Z',
      estado_envio: 'Pendiente'
    },
    {
      id_correo: 102,
      asunto: 'Reporte de inasistencia',
      remitente_nombre: 'Jorge Salgado',
      rol: 'Docente',
      mensaje: 'El estudiante presentó una inasistencia no justificada.',
      tipo_notificacion: 'Inasistencia',
      fecha_envio: '2026-10-12T08:30:00.000Z',
      estado_envio: 'Enviado'
    }
  ];

  beforeEach(() => {
    cy.on('window:confirm', () => true);
    cy.on('window:alert', () => true);

    // 1. Interceptar el healthcheck inicial de App.jsx
    cy.intercept('GET', '**/api/mensaje', {
      statusCode: 200,
      body: { mensaje: "Conectado" }
    }).as('mensajeBackend');

    // 2. Interceptar la petición de notificaciones/correos del acudiente
    cy.intercept('GET', '**/api/correos_notificaciones/acudiente/*', {
      statusCode: 200,
      body: notificacionesMock
    }).as('getNotificacionesAcudiente');

    // 3. Inyectar sesión de acudiente (cargo 4) en localStorage
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('usuario', JSON.stringify(usuarioMock));
        win.localStorage.setItem('token', 'token-falso-cypress');
      }
    });

    // 4. Entrar a la ruta del acudiente
    cy.visit('/acudiente');
  });

  // ============================================
  // CASOS DE PRUEBA DE CAJA NEGRA
  // ============================================

  it('CP-UI-01: Debe cargar correctamente la URL de inicio del acudiente (/acudiente)', () => {
    cy.url().should('include', '/acudiente');
  });

  it('CP-UI-02: Debe solicitar los correos y notificaciones al backend (GET /api/correos_notificaciones/acudiente/*)', () => {
    cy.wait('@getNotificacionesAcudiente').its('response.statusCode').should('eq', 200);
    cy.contains('Buzón - Resumen').should('be.visible');
  });

  it('CP-UI-03: Debe calcular y mostrar el badge con el conteo de no leídos', () => {
    cy.contains('.badge', '1 nuevos').should('be.visible');
  });

  it('CP-UI-04: Debe desplegar el modal de detalle al hacer clic en un correo de la lista', () => {
    cy.wait('@getNotificacionesAcudiente');
    cy.contains('Carlos Rodríguez').click();

    // Validar visibilidad del modal y su contenido
    cy.get('.modal').should('be.visible');
    cy.contains('.modal-title', 'Citación a reunión de padres').should('be.visible');
    cy.contains('Estimado acudiente, se le cita a reunión').should('be.visible');

    // Cerrar el modal
    cy.contains('.modal-footer button', 'Cerrar').click();
    cy.get('.modal').should('not.exist');
  });

  it('CP-UI-05: Debe cambiar a la vista de "Buzón Completo" con buscador al hacer clic en "Ver todo"', () => {
    cy.wait('@getNotificacionesAcudiente');
    cy.contains('button', 'Ver todo').click();

    // Validar cambio de encabezado y presencia del buscador
    cy.contains('h2', 'Buzón Completo').should('be.visible');
    cy.get('input[placeholder*="Buscar por asunto"]').should('be.visible');

    // Probar filtrado en el buscador
    cy.get('input[placeholder*="Buscar por asunto"]').type('Citación');
    cy.contains('Citación a reunión de padres').should('be.visible');

    // Probar el botón de volver
    cy.contains('button', 'Volver al Inicio').click();
    cy.contains('h2', 'Inicio').should('be.visible');
  });

});