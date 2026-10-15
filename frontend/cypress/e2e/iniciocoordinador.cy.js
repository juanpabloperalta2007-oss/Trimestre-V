describe('Pruebas de Caja Negra - Inicio Coordinador (UI)', () => {

  const usuarioMock = {
    id_usuario: 3,
    nombre: 'Jhoan Castro Feria',
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

    // 2. Inyectar sesión de coordinador en localStorage antes de cargar la app
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('usuario', JSON.stringify(usuarioMock));
        win.localStorage.setItem('token', 'token-falso-cypress');
      }
    });

    // 3. Entrar a la ruta del coordinador
    cy.visit('/coordinador');
  });

  // ============================================
  // CASOS DE PRUEBA DE CAJA NEGRA
  // ============================================

  it('CP-UI-01: Debe cargar correctamente la URL de inicio del coordinador (/coordinador)', () => {
    cy.url().should('include', '/coordinador');
  });

  it('CP-UI-02: Debe mostrar el título principal "Panel del Coordinador" y el texto de bienvenida', () => {
    cy.contains('h2', 'Panel del Coordinador').should('be.visible');
    cy.contains('p', 'Bienvenido al sistema de gestión académica.').should('be.visible');
  });

  it('CP-UI-03: Debe renderizar las 4 tarjetas principales de acceso directo (Cursos, Alertas, Excusas, Reportes)', () => {
    cy.contains('h5', 'Cursos').should('be.visible');
    cy.contains('h5', 'Alertas').should('be.visible');
    cy.contains('h5', 'Excusas').should('be.visible');
    cy.contains('h5', 'Reportes').should('be.visible');
  });

  it('CP-UI-04: Debe verificar que el botón de administrar cursos redirija correctamente', () => {
    cy.contains('a', 'Administrar').should('have.attr', 'href', '/cursos');
  });

  it('CP-UI-05: Debe verificar que los enlaces de redirección a excusas y reportes sean válidos', () => {
    cy.contains('a', 'Gestionar').should('have.attr', 'href', '/gestion-excusas');
    cy.contains('a', 'Ver').should('have.attr', 'href', '/reportes');
  });

});