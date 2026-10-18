describe('Pruebas de Caja Negra - Permisos (UI)', () => {

  const RUTA = '/permisos';

  const usuarioAdmin = {
    id_cargo: 1,
    login: 'admin@liceo.edu.co',
    nombre: 'Andres Cypress',
    rol: 'Administrador'
  };

  // Permisos que "devuelve" el backend por cargo (a propósito distintos de los de por defecto)
  const permisosMock = {
    1: ['USUARIOS_VER', 'CALENDARIO_VER'],
    2: ['ASISTENCIA_CONSULTAR'],
    3: ['ASISTENCIA_TOMAR', 'ASISTENCIA_CONSULTAR', 'CALENDARIO_VER'],
    4: []
  };

  const CHECKBOXES = 'form input[type="checkbox"]';

  // Busca un checkbox por el texto de su etiqueta
  const casilla = (texto) => cy.contains('label', texto).find('input[type="checkbox"]');

  // Simula sesión iniciada y la respuesta de GET /api/cargos/:id/permisos.
  // Cada petición recibe un alias propio según el cargo: getPermisos1, getPermisos2...
  const visitarConSesion = (usuario = usuarioAdmin, respuestaGet = null) => {
    cy.intercept('GET', '**/api/mensaje', { body: {} }); // evita el 404 de App.jsx

    cy.intercept('GET', '**/api/cargos/*/permisos', (req) => {
      const id = req.url.match(/cargos\/(\d+)\/permisos/)[1];
      req.alias = `getPermisos${id}`;
      req.reply(respuestaGet || { body: { permisos: permisosMock[id] || [] } });
    });

    cy.visit(RUTA, {
      onBeforeLoad(win) {
        win.localStorage.setItem('usuario', JSON.stringify(usuario));
      }
    });
  };

  // En desarrollo, React StrictMode lanza la petición inicial dos veces.
  // Se espera la primera y se deja un margen para que termine la segunda,
  // así no pisa los cambios que haga el test.
  const esperarCarga = (idCargo = 1) => {
    cy.wait(`@getPermisos${idCargo}`);
    cy.wait(300);
  };

  const interceptarPut = (respuesta = { statusCode: 200, body: {} }) => {
    cy.intercept('PUT', '**/api/cargos/*/permisos', respuesta).as('putPermisos');
  };

  // ============================================
  // CASOS BÁSICOS
  // ============================================
  it('CP-UI-01: Debe cargar la página de permisos', () => {
    visitarConSesion();
    cy.url().should('include', RUTA);
  });

  it('CP-UI-02: Debe mostrar el título "GESTIÓN DE PERMISOS POR CARGO"', () => {
    visitarConSesion();
    cy.contains('h2, h1', 'GESTIÓN DE PERMISOS POR CARGO').should('be.visible');
  });

  it('CP-UI-03: Debe mostrar la descripción de la pantalla', () => {
    visitarConSesion();
    cy.contains('Configura los accesos y acciones del sistema para cada rol escolar.')
      .should('be.visible');
  });

  // ============================================
  // SELECTOR DE CARGO
  // ============================================
  it('CP-UI-04: Debe mostrar el selector de cargo con los 4 cargos', () => {
    visitarConSesion();
    cy.contains('label', 'Cargo:').should('be.visible');
    cy.get('#selectCargo option').should('have.length', 4);
    cy.get('#selectCargo')
      .should('contain', 'Administrador')
      .and('contain', 'Coordinador')
      .and('contain', 'Profesor')
      .and('contain', 'Acudiente');
  });

  it('CP-UI-05: Por defecto debe estar seleccionado el cargo Administrador', () => {
    visitarConSesion();
    cy.get('#selectCargo').should('have.value', '1');
  });

  // ============================================
  // ESTRUCTURA DEL FORMULARIO
  // ============================================
  it('CP-UI-06: Debe mostrar las 4 secciones de permisos', () => {
    visitarConSesion();
    cy.contains('span', 'Usuarios y Cuentas').should('be.visible');
    cy.contains('span', 'Estructura Académica').should('be.visible');
    cy.contains('span', 'Control de Asistencias').should('be.visible');
    cy.contains('span', 'Comunicaciones y Agenda').should('be.visible');
  });

  it('CP-UI-07: Debe mostrar los 13 permisos como casillas de verificación', () => {
    visitarConSesion();
    cy.get(CHECKBOXES).should('have.length', 13);
  });

  // ============================================
  // CARGA DE PERMISOS
  // ============================================
  it('CP-UI-08: Al entrar debe pedir los permisos del cargo 1', () => {
    visitarConSesion();
    cy.wait('@getPermisos1').its('request.url').should('include', '/api/cargos/1/permisos');
  });

  it('CP-UI-09: Debe marcar solo los permisos que devuelve el backend', () => {
    visitarConSesion();
    esperarCarga();
    cy.get(`${CHECKBOXES}:checked`).should('have.length', 2);
    casilla('Consultar directorio de personas').should('be.checked');
    casilla('Consultar agenda e informes').should('be.checked');
    casilla('Registrar nuevos usuarios').should('not.be.checked');
  });

  it('CP-UI-10: Al cambiar a Profesor debe pedir y mostrar sus permisos', () => {
    visitarConSesion();
    esperarCarga();

    cy.get('#selectCargo').select('3');
    cy.wait('@getPermisos3').its('request.url').should('include', '/api/cargos/3/permisos');

    cy.get(`${CHECKBOXES}:checked`).should('have.length', 3);
    casilla('Registrar asistencia diaria').should('be.checked');
    casilla('Registrar nuevos usuarios').should('not.be.checked');
  });

  it('CP-UI-11: Un cargo sin permisos debe mostrar todas las casillas vacías', () => {
    visitarConSesion();
    esperarCarga();
    cy.get('#selectCargo').select('4');
    cy.wait('@getPermisos4');
    cy.get(`${CHECKBOXES}:checked`).should('have.length', 0);
  });

  it('CP-UI-12: Si el backend falla (500), carga los permisos por defecto del Administrador', () => {
    visitarConSesion(usuarioAdmin, { statusCode: 500, body: {} });
    esperarCarga();
    cy.get(`${CHECKBOXES}:checked`).should('have.length', 13);
  });

  it('CP-UI-13: Si el backend falla (500), carga los permisos por defecto del Acudiente', () => {
    visitarConSesion(usuarioAdmin, { statusCode: 500, body: {} });
    esperarCarga();
    cy.get('#selectCargo').select('4');
    cy.wait('@getPermisos4');
    cy.get(`${CHECKBOXES}:checked`).should('have.length', 2);
    casilla('Consultar historial de asistencia').should('be.checked');
    casilla('Consultar agenda e informes').should('be.checked');
  });

  it('CP-UI-14: Sin conexión con el backend, carga los permisos por defecto', () => {
    visitarConSesion(usuarioAdmin, { forceNetworkError: true });
    cy.get(`${CHECKBOXES}:checked`).should('have.length', 13);
  });

  // ============================================
  // INTERACCIÓN CON LAS CASILLAS
  // ============================================
  it('CP-UI-15: Debe poder marcar un permiso', () => {
    visitarConSesion();
    esperarCarga();
    casilla('Registrar nuevos usuarios').check().should('be.checked');
  });

  it('CP-UI-16: Debe poder desmarcar un permiso', () => {
    visitarConSesion();
    esperarCarga();
    casilla('Consultar directorio de personas').uncheck().should('not.be.checked');
  });

  // ============================================
  // BOTONES
  // ============================================
  it('CP-UI-17: Debe mostrar los botones "Restablecer" y "Guardar Permisos"', () => {
    visitarConSesion();
    cy.contains('button', 'Restablecer').should('be.visible');
    cy.contains('button', 'Guardar Permisos').should('be.visible');
  });

  it('CP-UI-18: "Restablecer" descarta los cambios y recarga los permisos del cargo', () => {
    visitarConSesion();
    esperarCarga();

    casilla('Registrar nuevos usuarios').check().should('be.checked');
    cy.contains('button', 'Restablecer').click();

    // Al recargar desde el backend, la casilla vuelve a quedar sin marcar
    casilla('Registrar nuevos usuarios').should('not.be.checked');
    casilla('Consultar directorio de personas').should('be.checked');
  });

  it('CP-UI-19: Los botones se deshabilitan mientras se cargan los permisos', () => {
    visitarConSesion(usuarioAdmin, { body: { permisos: permisosMock[1] }, delay: 1000 });
    cy.contains('button', 'Restablecer').should('be.disabled');
    cy.get('button[type="submit"]').should('be.disabled');

    cy.contains('button', 'Restablecer').should('not.be.disabled');
    cy.get('button[type="submit"]').should('not.be.disabled').and('contain', 'Guardar Permisos');
  });

  // ============================================
  // GUARDAR PERMISOS
  // ============================================
  it('CP-UI-20: "Guardar Permisos" debe enviar los permisos seleccionados al backend', () => {
    interceptarPut();
    visitarConSesion();
    esperarCarga();

    casilla('Registrar nuevos usuarios').check();
    cy.contains('button', 'Guardar Permisos').click();

    cy.wait('@putPermisos').then(({ request }) => {
      expect(request.url).to.include('/api/cargos/1/permisos');
      expect(request.body).to.deep.equal({
        permisos: ['USUARIOS_VER', 'CALENDARIO_VER', 'USUARIOS_CREAR']
      });
    });
  });

  it('CP-UI-21: Al guardar correctamente debe mostrar el mensaje de éxito', () => {
    interceptarPut();
    visitarConSesion();
    esperarCarga();

    cy.contains('button', 'Guardar Permisos').click();
    cy.contains('Permisos actualizados correctamente.').should('be.visible');
  });

  it('CP-UI-22: Guardar con otro cargo debe usar la URL de ese cargo', () => {
    interceptarPut();
    visitarConSesion();
    esperarCarga();

    cy.get('#selectCargo').select('2');
    esperarCarga(2);
    cy.contains('button', 'Guardar Permisos').click();

    cy.wait('@putPermisos').its('request.url').should('include', '/api/cargos/2/permisos');
  });

  it('CP-UI-23: Desmarcar todos los permisos y guardar debe enviar una lista vacía', () => {
    interceptarPut();
    visitarConSesion();
    esperarCarga();

    casilla('Consultar directorio de personas').uncheck();
    casilla('Consultar agenda e informes').uncheck();
    cy.contains('button', 'Guardar Permisos').click();

    cy.wait('@putPermisos').its('request.body').should('deep.equal', { permisos: [] });
  });

  it('CP-UI-24: Si el backend falla al guardar (500), muestra "guardados localmente"', () => {
    interceptarPut({ statusCode: 500, body: {} });
    visitarConSesion();
    esperarCarga();

    cy.contains('button', 'Guardar Permisos').click();
    cy.contains('Permisos guardados localmente.').should('be.visible');
    cy.contains('Permisos actualizados correctamente.').should('not.exist');
  });

  it('CP-UI-25: Sin conexión al guardar, muestra "guardados localmente"', () => {
    interceptarPut({ forceNetworkError: true });
    visitarConSesion();
    esperarCarga();

    cy.contains('button', 'Guardar Permisos').click();
    cy.contains('Permisos guardados localmente.').should('be.visible');
  });

  it('CP-UI-26: El mensaje desaparece al cambiar de cargo', () => {
    interceptarPut();
    visitarConSesion();
    esperarCarga();

    cy.contains('button', 'Guardar Permisos').click();
    cy.contains('Permisos actualizados correctamente.').should('be.visible');

    cy.get('#selectCargo').select('3');
    cy.contains('Permisos actualizados correctamente.').should('not.exist');
  });

  // ============================================
  // SIDEBAR
  // ============================================
  it('CP-UI-27: En /permisos, la opción "Permisos" del sidebar queda resaltada', () => {
    visitarConSesion();
    cy.contains('.list-group a', 'Permisos').should('have.class', 'active');
    cy.contains('.list-group a', 'Inicio').should('not.have.class', 'active');
  });

  // ============================================
  // CONTROL DE ACCESO
  // ============================================
  it('CP-UI-28: Sin sesión NO debe acceder (redirige al login)', () => {
    cy.visit(RUTA);
    cy.location('pathname').should('eq', '/');
  });

  it('CP-UI-29: Un docente (cargo 3) NO debe acceder a permisos', () => {
    visitarConSesion({ id_cargo: 3, nombre: 'Docente Test', rol: 'Docente' });
    cy.location('pathname').should('not.eq', RUTA);
  });

  it('CP-UI-30: Un acudiente (cargo 4) NO debe acceder a permisos', () => {
    visitarConSesion({ id_cargo: 4, nombre: 'Acudiente Test', rol: 'Acudiente' });
    cy.location('pathname').should('not.eq', RUTA);
  });

  it('CP-UI-31: Un coordinador (cargo 2) NO debe acceder a permisos', () => {
    visitarConSesion({ id_cargo: 2, nombre: 'Coordinador Test', rol: 'Coordinador' });
    cy.location('pathname').should('not.eq', RUTA);
  });

});