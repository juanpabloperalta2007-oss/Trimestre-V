describe('Pruebas de Caja Negra - Vista Admin (UI)', () => {

    // temporal 
    it('debug título', () => {
  visitarConSesion();
  cy.get('h2').first().invoke('text').then((t) => {
    cy.log(JSON.stringify(t));
    cy.log('¿Normalizado?', t === t.normalize('NFC'));
  });
});
  const RUTA = '/vista_admin';

  const usuarioAdmin = {
    id_cargo: 1,
    login: 'admin@liceo.edu.co',
    nombre: 'Andres Cypress',
    rol: 'Administrador'
  };

  const usuariosMock = [
    { id_usuario: 1, login: 'ana@liceo.edu.co', estado: 'Activo' },
    { id_usuario: 2, login: 'luis@liceo.edu.co', estado: 'Inactivo' },
    { id_usuario: 3, login: 'maria@liceo.edu.co', estado: 'Activo' }
  ];

  // Simula sesión iniciada y la respuesta de GET /api/usuarios
  const visitarConSesion = (usuario = usuarioAdmin, respuesta = { body: usuariosMock }) => {
    cy.intercept('GET', '**/api/mensaje', { body: {} }); // evita el 404 de App.jsx
    cy.intercept('GET', '**/api/usuarios', respuesta).as('getUsuarios');
    cy.visit(RUTA, {
      onBeforeLoad(win) {
        win.localStorage.setItem('usuario', JSON.stringify(usuario));
      }
    });
  };

  // ============================================
  // CASOS BÁSICOS
  // ============================================
  it('CP-UI-01: Debe cargar la página de gestión de usuarios', () => {
    visitarConSesion();
    cy.url().should('include', RUTA);
  });

  it('CP-UI-02: Debe mostrar el título "Gestión de Usuarios"', () => {
    visitarConSesion();
    cy.contains('h2, h1', 'Gestión de Usuarios').should('be.visible');
  });

  // ============================================
  // HEADER
  // ============================================
  it('CP-UI-03: El header debe mostrar el nombre de la institución', () => {
    visitarConSesion();
    cy.get('header').contains('Liceo Antonio de Toledo').should('be.visible');
  });

  it('CP-UI-04: El header debe mostrar el login del usuario en sesión', () => {
    visitarConSesion();
    cy.get('header').contains('admin@liceo.edu.co').should('be.visible');
  });

  it('CP-UI-05: El header debe mostrar "Usuario" si no hay login ni correo', () => {
    visitarConSesion({ id_cargo: 1, nombre: 'Sin Login', rol: 'Administrador' });
    cy.get('header').contains('span', 'Usuario').should('be.visible');
  });

  it('CP-UI-06: El header debe mostrar el botón "Cerrar Sesión" y la insignia GAE', () => {
    visitarConSesion();
    cy.get('header').contains('button', 'Cerrar Sesión').should('be.visible');
    cy.get('header').contains('GAE').should('be.visible');
  });

  // ============================================
  // SIDEBAR
  // ============================================
  it('CP-UI-07: El sidebar debe mostrar el título "Administrador"', () => {
    visitarConSesion();
    cy.contains('h6', 'Administrador').should('be.visible');
  });

  it('CP-UI-08: El sidebar debe mostrar los 3 enlaces del menú', () => {
    visitarConSesion();
    cy.get('.list-group a').should('have.length', 3);
    cy.contains('.list-group a', 'Inicio').should('be.visible');
    cy.contains('.list-group a', 'Registrar Usuario').should('be.visible');
    cy.contains('.list-group a', 'Permisos').should('be.visible');
  });

  it('CP-UI-09: "Inicio" debe estar resaltado en /vista_admin', () => {
    visitarConSesion();
    cy.contains('.list-group a', 'Inicio').should('have.class', 'active');
  });

  it('CP-UI-10: "Registrar Usuario" debe llevar a /registrar_usuario', () => {
    visitarConSesion();
    cy.contains('.list-group a', 'Registrar Usuario').click();
    cy.location('pathname').should('eq', '/registrar_usuario');
  });

  it('CP-UI-11: "Permisos" debe llevar a /permisos y quedar resaltado', () => {
    visitarConSesion();
    cy.contains('.list-group a', 'Permisos').click();
    cy.location('pathname').should('eq', '/permisos');
    cy.contains('.list-group a', 'Permisos').should('have.class', 'active');
    cy.contains('.list-group a', 'Inicio').should('not.have.class', 'active');
  });

  // ============================================
  // LISTADO DE USUARIOS
  // ============================================
  it('CP-UI-12: Debe mostrar los encabezados de la tabla', () => {
    visitarConSesion();
    cy.contains('th', 'Usuario (Correo)').should('be.visible');
    cy.contains('th', 'Estado').should('be.visible');
    cy.contains('th', 'Acciones').should('be.visible');
  });

  it('CP-UI-13: Debe mostrar "Cargando usuarios..." mientras carga', () => {
    visitarConSesion(usuarioAdmin, { body: usuariosMock, delay: 1000 });
    cy.contains('Cargando usuarios...').should('be.visible');
  });

  it('CP-UI-14: Debe listar los usuarios con su correo y estado', () => {
    visitarConSesion();
    cy.wait('@getUsuarios');
    cy.get('table.tabla-usuarios tbody tr').should('have.length', 3);
    cy.contains('tr', 'ana@liceo.edu.co').should('contain', 'Activo');
    cy.contains('tr', 'luis@liceo.edu.co').should('contain', 'Inactivo');
  });

  it('CP-UI-15: Debe mostrar mensaje cuando no hay usuarios', () => {
    visitarConSesion(usuarioAdmin, { body: [] });
    cy.contains('No se encontraron usuarios.').should('be.visible');
  });

  it('CP-UI-16: Si el backend falla, la pantalla no se rompe', () => {
    visitarConSesion(usuarioAdmin, { statusCode: 500, body: { error: 'fallo' } });
    cy.contains('h2', 'Gestión de Usuarios').should('be.visible');
    cy.contains('No se encontraron usuarios.').should('be.visible');
  });

  // ============================================
  // BÚSQUEDA
  // ============================================
  it('CP-UI-17: Debe mostrar el campo de búsqueda con su placeholder', () => {
    visitarConSesion();
    cy.get('input.buscador')
      .should('be.visible')
      .and('have.attr', 'placeholder', 'Buscar por correo/login...');
  });

  it('CP-UI-18: Debe filtrar usuarios por correo/login', () => {
    visitarConSesion();
    cy.wait('@getUsuarios');
    cy.get('input.buscador').type('ana@');
    cy.get('table.tabla-usuarios tbody tr').should('have.length', 1);
    cy.contains('td', 'ana@liceo.edu.co').should('be.visible');
  });

  it('CP-UI-19: Debe filtrar usuarios por estado', () => {
    visitarConSesion();
    cy.wait('@getUsuarios');
    cy.get('input.buscador').type('Inactivo');
    cy.get('table.tabla-usuarios tbody tr').should('have.length', 1);
    cy.contains('td', 'luis@liceo.edu.co').should('be.visible');
  });

  it('CP-UI-20: La búsqueda no debe distinguir mayúsculas de minúsculas', () => {
    visitarConSesion();
    cy.wait('@getUsuarios');
    cy.get('input.buscador').type('ANA@LICEO');
    cy.get('table.tabla-usuarios tbody tr').should('have.length', 1);
  });

  it('CP-UI-21: Debe mostrar mensaje si la búsqueda no tiene resultados', () => {
    visitarConSesion();
    cy.wait('@getUsuarios');
    cy.get('input.buscador').type('zzzzz');
    cy.contains('No se encontraron usuarios.').should('be.visible');
  });

  it('CP-UI-22: Al borrar la búsqueda debe volver a mostrar todos los usuarios', () => {
    visitarConSesion();
    cy.wait('@getUsuarios');
    cy.get('input.buscador').type('ana@').clear();
    cy.get('table.tabla-usuarios tbody tr').should('have.length', 3);
  });

  // ============================================
  // ACCIONES POR USUARIO
  // ============================================
  it('CP-UI-23: Cada fila debe tener los botones Ver, Editar y Eliminar', () => {
    visitarConSesion();
    cy.wait('@getUsuarios');
    cy.contains('tr', 'ana@liceo.edu.co').within(() => {
      cy.contains('button', 'Ver').should('be.visible');
      cy.contains('button', 'Editar').should('be.visible');
      cy.contains('button', 'Eliminar').should('be.visible');
    });
  });

  it('CP-UI-24: El botón "Ver" debe llevar a /ver_usuario', () => {
    visitarConSesion();
    cy.wait('@getUsuarios');
    cy.contains('tr', 'ana@liceo.edu.co').contains('button', 'Ver').click();
    cy.location('pathname').should('eq', '/ver_usuario');
  });

  it('CP-UI-25: El botón "Editar" debe llevar a /editar_usuario', () => {
    visitarConSesion();
    cy.wait('@getUsuarios');
    cy.contains('tr', 'ana@liceo.edu.co').contains('button', 'Editar').click();
    cy.location('pathname').should('eq', '/editar_usuario');
  });

  it('CP-UI-26: "Eliminar" pide confirmación y, si se acepta, llama al backend', () => {
    cy.intercept('DELETE', '**/api/usuarios/*', { statusCode: 200, body: {} }).as('deleteUsuario');
    visitarConSesion();
    cy.wait('@getUsuarios');

    cy.on('window:confirm', (mensaje) => {
      expect(mensaje).to.eq('¿Estás seguro de que deseas eliminar este usuario?');
      return true;
    });

    cy.contains('tr', 'ana@liceo.edu.co').contains('button', 'Eliminar').click();
    cy.wait('@deleteUsuario').its('request.url').should('include', '/api/usuarios/1');
  });

  it('CP-UI-27: "Eliminar" cancelando la confirmación NO debe borrar', () => {
    cy.intercept('DELETE', '**/api/usuarios/*', { statusCode: 200, body: {} }).as('deleteUsuario');
    visitarConSesion();
    cy.wait('@getUsuarios');

    cy.on('window:confirm', () => false);

    cy.contains('tr', 'ana@liceo.edu.co').contains('button', 'Eliminar').click();
    cy.get('@deleteUsuario.all').should('have.length', 0);
    cy.contains('td', 'ana@liceo.edu.co').should('be.visible');
  });

  // ============================================
  // CIERRE DE SESIÓN (Header)
  // ============================================
  it('CP-UI-28: "Cerrar Sesión" aceptando la confirmación redirige al login', () => {
    visitarConSesion();
    cy.on('window:confirm', (mensaje) => {
      expect(mensaje).to.eq('¿Está seguro de que desea cerrar la sesión?');
      return true;
    });

    cy.get('header').contains('button', 'Cerrar Sesión').click();
    cy.location('pathname').should('eq', '/');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('usuario')).to.be.null;
    });
  });

  it('CP-UI-29: "Cerrar Sesión" cancelando la confirmación mantiene la sesión', () => {
    visitarConSesion();
    cy.on('window:confirm', () => false);

    cy.get('header').contains('button', 'Cerrar Sesión').click();
    cy.location('pathname').should('eq', RUTA);
    cy.window().then((win) => {
      expect(win.localStorage.getItem('usuario')).to.not.be.null;
    });
  });

  it('CP-UI-30: Después de cerrar sesión no se puede volver al panel', () => {
    visitarConSesion();
    cy.get('header').contains('button', 'Cerrar Sesión').click();
    cy.location('pathname').should('eq', '/');

    cy.visit(RUTA);
    cy.location('pathname').should('eq', '/');
  });

  // ============================================
  // CONTROL DE ACCESO
  // ============================================
  it('CP-UI-31: Sin sesión NO debe acceder (redirige al login)', () => {
    cy.visit(RUTA);
    cy.location('pathname').should('eq', '/');
  });

  it('CP-UI-32: Un docente (cargo 3) NO debe acceder a la vista de administrador', () => {
    visitarConSesion({ id_cargo: 3, nombre: 'Docente Test', rol: 'Docente' });
    cy.location('pathname').should('not.eq', RUTA);
  });

  it('CP-UI-33: Un acudiente (cargo 4) NO debe acceder a la vista de administrador', () => {
    visitarConSesion({ id_cargo: 4, nombre: 'Acudiente Test', rol: 'Acudiente' });
    cy.location('pathname').should('not.eq', RUTA);
  });

  it('CP-UI-34: Una sesión corrupta en localStorage redirige al login', () => {
    cy.visit(RUTA, {
      onBeforeLoad(win) {
        win.localStorage.setItem('usuario', 'esto-no-es-json');
      }
    });
    cy.location('pathname').should('eq', '/');
  });

});