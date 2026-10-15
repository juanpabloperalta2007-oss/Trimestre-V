describe('Pruebas de Caja Negra - AdminDashboard (UI)', () => {

  const RUTA = '/admin';

  const usuarioAdmin = {
    id_cargo: 1,
    nombre: 'Andres Cypress',
    rol: 'Administrador'
  };

  // Simula una sesión iniciada guardando el usuario en localStorage
  const visitarConSesion = (usuario = usuarioAdmin) => {
    cy.visit(RUTA, {
      onBeforeLoad(win) {
        win.localStorage.setItem('usuario', JSON.stringify(usuario));
      }
    });
  };

  beforeEach(() => {
    cy.on('window:confirm', () => true);
    cy.on('window:alert', () => true);
  });

  // ============================================
  // CASOS BÁSICOS
  // ============================================
  it('CP-UI-01: Debe cargar la página del panel de administrador', () => {
    visitarConSesion();
    cy.url().should('include', RUTA);
  });

  it('CP-UI-02: Debe mostrar el título "Panel de Administrador"', () => {
    visitarConSesion();
    cy.contains('h2, h1', 'Panel de Administrador').should('be.visible');
  });

  // ============================================
  // DATOS DEL USUARIO
  // ============================================
  it('CP-UI-03: Debe mostrar el nombre del usuario en el saludo', () => {
    visitarConSesion();
    cy.contains('Bienvenido, Andres Cypress').should('be.visible');
  });

  it('CP-UI-04: Debe mostrar "Administrador" si el usuario no tiene nombre', () => {
    visitarConSesion({ id_cargo: 1, rol: 'Administrador' });
    cy.contains('Bienvenido, Administrador').should('be.visible');
  });

  it('CP-UI-05: Debe mostrar el rol del usuario', () => {
    visitarConSesion();
    cy.contains('Rol:').should('be.visible');
    cy.contains('Administrador').should('be.visible');
  });

  // ============================================
  // CIERRE DE SESIÓN
  // ============================================
  it('CP-UI-06: Debe mostrar el botón "Cerrar Sesión"', () => {
    visitarConSesion();
    cy.contains('button', 'Cerrar Sesión').should('be.visible');
  });

  it('CP-UI-07: Debe cerrar sesión y redirigir al login', () => {
    visitarConSesion();
    cy.contains('button', 'Cerrar Sesión').click();

    cy.location('pathname').should('eq', '/');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('usuario')).to.be.null;
    });
  });

  it('CP-UI-08: Después de cerrar sesión no se puede volver al panel', () => {
    visitarConSesion();
    cy.contains('button', 'Cerrar Sesión').click();
    cy.location('pathname').should('eq', '/');

    cy.visit(RUTA);
    cy.location('pathname').should('eq', '/');
  });

  // ============================================
  // CONTROL DE ACCESO
  // ============================================
  it('CP-UI-09: Sin sesión NO debe acceder al panel (redirige al login)', () => {
    cy.visit(RUTA);
    cy.location('pathname').should('eq', '/');
  });

  it('CP-UI-10: Un docente (cargo 3) NO debe acceder al panel de administrador', () => {
    visitarConSesion({ id_cargo: 3, nombre: 'Docente Test', rol: 'Docente' });
    cy.location('pathname').should('not.eq', RUTA);
  });

  it('CP-UI-11: Un acudiente (cargo 4) NO debe acceder al panel de administrador', () => {
    visitarConSesion({ id_cargo: 4, nombre: 'Acudiente Test', rol: 'Acudiente' });
    cy.location('pathname').should('not.eq', RUTA);
  });

});