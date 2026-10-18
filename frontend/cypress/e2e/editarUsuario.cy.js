describe('Pruebas de Caja Negra - Editar Usuario (UI)', () => {

  const RUTA = '/editar_usuario';

  const usuarioAdmin = {
    id_cargo: 1,
    login: 'admin@liceo.edu.co',
    nombre: 'Andres Cypress',
    rol: 'Administrador'
  };

  // El tercer usuario no trae estado ni cargo: sirve para probar los valores por defecto
  const usuariosMock = [
    { id_usuario: 1, login: 'ana@liceo.edu.co', estado: 'Activo', id_cargo: 2 },
    { id_usuario: 2, login: 'luis@liceo.edu.co', estado: 'Inactivo', id_cargo: 4 },
    { id_usuario: 3, login: 'maria@liceo.edu.co' }
  ];

  // Los labels no están vinculados a los inputs: se busca el campo dentro del mismo contenedor
  const inputLogin = () => cy.contains('label', 'Correo / Login').parent().find('input');
  const selectCargo = () => cy.contains('label', 'Cargo').parent().find('select');
  const selectEstado = () => cy.contains('label', 'Estado').parent().find('select');

  const guardar = () => cy.contains('button', 'Guardar Cambios').click();

  const interceptarPut = (respuesta = { statusCode: 200, body: { mensaje: 'ok' } }) => {
    cy.intercept('PUT', '**/api/usuarios/*', respuesta).as('putUsuario');
  };

  const espiarAlertas = () => {
    const alerta = cy.stub().as('alerta');
    cy.on('window:alert', alerta);
  };

  const prepararSesion = (usuario = usuarioAdmin) => {
    cy.intercept('GET', '**/api/mensaje', { body: {} }); // evita el 404 de App.jsx
    cy.intercept('GET', '**/api/usuarios', { body: usuariosMock }).as('getUsuarios');
    return {
      onBeforeLoad(win) {
        win.localStorage.setItem('usuario', JSON.stringify(usuario));
      }
    };
  };

  // Flujo real: entrar a Vista Admin y pulsar "Editar" en la fila del usuario
  const visitarEditar = (correoFila = 'ana@liceo.edu.co', usuario = usuarioAdmin) => {
    cy.visit('/vista_admin', prepararSesion(usuario));
    cy.wait('@getUsuarios');
    cy.contains('tr', correoFila).contains('button', 'Editar').click();
    cy.location('pathname').should('eq', RUTA);
  };

  // Acceso directo a la URL (sin pasar por la lista): la pantalla no recibe datos
  const visitarDirecto = (usuario = usuarioAdmin) => {
    cy.visit(RUTA, prepararSesion(usuario));
  };

  // ============================================
  // CASOS BÁSICOS
  // ============================================
  it('CP-UI-01: Debe cargar la página de editar usuario', () => {
    visitarEditar();
    cy.url().should('include', RUTA);
  });

  it('CP-UI-02: Debe mostrar el título "Editar Usuario"', () => {
    visitarEditar();
    cy.contains('h2, h1', 'Editar Usuario').should('be.visible');
  });

  it('CP-UI-03: Debe mostrar la descripción de la pantalla', () => {
    visitarEditar();
    cy.contains('Modifique la información del usuario.').should('be.visible');
  });

  it('CP-UI-04: En esta pantalla ninguna opción del sidebar queda resaltada', () => {
    visitarEditar();
    cy.get('.list-group a').should('have.length', 3);
    cy.get('.list-group a.active').should('not.exist');
  });

  // ============================================
  // ESTRUCTURA DEL FORMULARIO
  // ============================================
  it('CP-UI-05: Debe mostrar los campos Correo / Login, Cargo y Estado', () => {
    visitarEditar();
    cy.contains('label', 'Correo / Login').should('be.visible');
    cy.contains('label', 'Cargo').should('be.visible');
    cy.contains('label', 'Estado').should('be.visible');
    inputLogin().should('be.visible');
    selectCargo().should('be.visible');
    selectEstado().should('be.visible');
  });

  it('CP-UI-06: El cargo debe ofrecer Administrador, Coordinador, Docente y Acudiente', () => {
    visitarEditar();
    selectCargo().find('option').should('have.length', 4);
    selectCargo()
      .should('contain', 'Administrador')
      .and('contain', 'Coordinador')
      .and('contain', 'Docente')
      .and('contain', 'Acudiente');
  });

  it('CP-UI-07: El estado debe ofrecer Activo e Inactivo', () => {
    visitarEditar();
    selectEstado().find('option').should('have.length', 2);
    selectEstado().should('contain', 'Activo').and('contain', 'Inactivo');
  });

  it('CP-UI-08: Debe mostrar los botones "Cancelar" y "Guardar Cambios" habilitados', () => {
    visitarEditar();
    cy.contains('button', 'Cancelar').should('be.visible').and('not.be.disabled');
    cy.contains('button', 'Guardar Cambios').should('be.visible').and('not.be.disabled');
  });

  // ============================================
  // DATOS PRECARGADOS
  // ============================================
  it('CP-UI-09: Debe mostrar los datos del usuario seleccionado (Ana)', () => {
    visitarEditar('ana@liceo.edu.co');
    inputLogin().should('have.value', 'ana@liceo.edu.co');
    selectCargo().should('have.value', '2');
    selectEstado().should('have.value', 'Activo');
  });

  it('CP-UI-10: Debe mostrar los datos de otro usuario (Luis)', () => {
    visitarEditar('luis@liceo.edu.co');
    inputLogin().should('have.value', 'luis@liceo.edu.co');
    selectCargo().should('have.value', '4');
    selectEstado().should('have.value', 'Inactivo');
  });

  it('CP-UI-11: Si el usuario no trae estado ni cargo, usa "Activo" y "Docente" por defecto', () => {
    visitarEditar('maria@liceo.edu.co');
    inputLogin().should('have.value', 'maria@liceo.edu.co');
    selectCargo().should('have.value', '3');
    selectEstado().should('have.value', 'Activo');
  });

  it('CP-UI-12: Entrando directo a la URL, el formulario aparece sin datos', () => {
    visitarDirecto();
    inputLogin().should('have.value', '');
    selectCargo().should('have.value', '3');
    selectEstado().should('have.value', 'Activo');
  });

  // ============================================
  // INTERACCIÓN CON EL FORMULARIO
  // ============================================
  it('CP-UI-13: Debe poder modificar el correo', () => {
    visitarEditar();
    inputLogin().clear().type('nuevo@liceo.edu.co').should('have.value', 'nuevo@liceo.edu.co');
  });

  it('CP-UI-14: Debe poder cambiar el cargo y el estado', () => {
    visitarEditar();
    selectCargo().select('Docente').should('have.value', '3');
    selectEstado().select('Inactivo').should('have.value', 'Inactivo');
  });

  // ============================================
  // VALIDACIONES AL GUARDAR
  // ============================================
  it('CP-UI-15: Entrando directo y pulsando Guardar, avisa que no hay ID de usuario', () => {
    interceptarPut();
    espiarAlertas();
    visitarDirecto();

    guardar();
    cy.get('@alerta').should('have.been.calledWith', 'No se encontró el ID del usuario.');
    cy.get('@putUsuario.all').should('have.length', 0);
  });

  it('CP-UI-16: Con el correo vacío, avisa que es obligatorio y no llama al backend', () => {
    interceptarPut();
    espiarAlertas();
    visitarEditar();

    inputLogin().clear();
    guardar();

    cy.get('@alerta').should('have.been.calledWith', 'El correo/login es obligatorio.');
    cy.get('@putUsuario.all').should('have.length', 0);
    cy.location('pathname').should('eq', RUTA);
  });

  // ============================================
  // GUARDAR CAMBIOS
  // ============================================
  it('CP-UI-17: Guardar sin cambios envía los datos originales del usuario', () => {
    interceptarPut();
    visitarEditar('ana@liceo.edu.co');

    guardar();

    cy.wait('@putUsuario').then(({ request }) => {
      expect(request.url).to.include('/api/usuarios/1');
      expect(request.body).to.deep.equal({
        login: 'ana@liceo.edu.co',
        estado: 'Activo',
        id_cargo: 2
      });
    });
  });

  it('CP-UI-18: Guardar un usuario distinto usa su propio ID en la URL', () => {
    interceptarPut();
    visitarEditar('luis@liceo.edu.co');

    guardar();
    cy.wait('@putUsuario').its('request.url').should('include', '/api/usuarios/2');
  });

  it('CP-UI-19: Al cambiar el correo, envía el nuevo correo', () => {
    interceptarPut();
    visitarEditar();

    inputLogin().clear().type('nuevo@liceo.edu.co');
    guardar();

    cy.wait('@putUsuario').its('request.body.login').should('eq', 'nuevo@liceo.edu.co');
  });

  it('CP-UI-20: Al cambiar el cargo, envía el cargo como número', () => {
    interceptarPut();
    visitarEditar();

    selectCargo().select('Docente');
    guardar();

        cy.wait('@putUsuario').its('request.body.id_cargo').should('eq', 3);
  });

  it('CP-UI-21: Al cambiar el estado a Inactivo, lo envía', () => {
    interceptarPut();
    visitarEditar();

    selectEstado().select('Inactivo');
    guardar();

    cy.wait('@putUsuario').its('request.body.estado').should('eq', 'Inactivo');
  });

  it('CP-UI-22: Cambiando correo, cargo y estado a la vez, envía los tres cambios', () => {
    interceptarPut();
    visitarEditar();

    inputLogin().clear().type('coordinadora@liceo.edu.co');
    selectCargo().select('Acudiente');
    selectEstado().select('Inactivo');
    guardar();

    cy.wait('@putUsuario').its('request.body').should('deep.equal', {
      login: 'coordinadora@liceo.edu.co',
      estado: 'Inactivo',
      id_cargo: 4
    });
  });

  it('CP-UI-23: Al guardar muestra el aviso de éxito y redirige a /vista_admin', () => {
    interceptarPut();
    espiarAlertas();
    visitarEditar();

    guardar();

    cy.wait('@putUsuario');
    cy.get('@alerta').should('have.been.calledWith', 'Usuario actualizado correctamente.');
    cy.location('pathname').should('eq', '/vista_admin');
  });

  it('CP-UI-24: Mientras guarda, muestra "Guardando..." y deshabilita los controles', () => {
    interceptarPut({ statusCode: 200, body: {}, delay: 1000 });
    visitarEditar();

    guardar();

    cy.contains('button', 'Guardando...').should('be.disabled');
    cy.contains('button', 'Cancelar').should('be.disabled');
    inputLogin().should('be.disabled');
    selectCargo().should('be.disabled');
    selectEstado().should('be.disabled');
    cy.wait('@putUsuario');
  });

  // ============================================
  // ERRORES DEL SERVIDOR
  // ============================================
  it('CP-UI-25: Si el servidor responde con error, muestra su mensaje y no redirige', () => {
    interceptarPut({ statusCode: 400, body: { error: 'El correo ya está registrado.' } });
    espiarAlertas();
    visitarEditar();

    guardar();

    cy.wait('@putUsuario');
    cy.get('@alerta').should(
      'have.been.calledWith',
      'Ocurrió un error al guardar: El correo ya está registrado.'
    );
    cy.location('pathname').should('eq', RUTA);
    cy.contains('button', 'Guardar Cambios').should('not.be.disabled');
  });

  it('CP-UI-26: Si el servidor falla sin mensaje (500), muestra el error de la petición', () => {
    interceptarPut({ statusCode: 500, body: {} });
    espiarAlertas();
    visitarEditar();

    guardar();

    cy.wait('@putUsuario');
    cy.get('@alerta').should(
      'have.been.calledWith',
      'Ocurrió un error al guardar: Request failed with status code 500'
    );
    cy.location('pathname').should('eq', RUTA);
  });

  it('CP-UI-27: Sin conexión con el backend, muestra el error de red', () => {
    interceptarPut({ forceNetworkError: true });
    espiarAlertas();
    visitarEditar();

    guardar();

    cy.get('@alerta').should(
      'have.been.calledWith',
      'Ocurrió un error al guardar: Network Error'
    );
    cy.location('pathname').should('eq', RUTA);
  });

  // ============================================
  // CANCELAR
  // ============================================
  it('CP-UI-28: "Cancelar" vuelve a /vista_admin sin guardar nada', () => {
    interceptarPut();
    visitarEditar();

    inputLogin().clear().type('cambio-descartado@liceo.edu.co');
    cy.contains('button', 'Cancelar').click();

    cy.location('pathname').should('eq', '/vista_admin');
    cy.get('@putUsuario.all').should('have.length', 0);
    cy.contains('td', 'ana@liceo.edu.co').should('be.visible');
  });

  // ============================================
  // CONTROL DE ACCESO
  // ============================================
  it('CP-UI-29: Sin sesión NO debe acceder (redirige al login)', () => {
    cy.visit(RUTA);
    cy.location('pathname').should('eq', '/');
  });

  it('CP-UI-30: Un docente (cargo 3) NO debe acceder a editar usuario', () => {
    visitarDirecto({ id_cargo: 3, nombre: 'Docente Test', rol: 'Docente' });
    cy.location('pathname').should('not.eq', RUTA);
  });

  it('CP-UI-31: Un acudiente (cargo 4) NO debe acceder a editar usuario', () => {
    visitarDirecto({ id_cargo: 4, nombre: 'Acudiente Test', rol: 'Acudiente' });
    cy.location('pathname').should('not.eq', RUTA);
  });

  it('CP-UI-32: Un coordinador (cargo 2) NO debe acceder a editar usuario', () => {
    visitarDirecto({ id_cargo: 2, nombre: 'Coordinador Test', rol: 'Coordinador' });
    cy.location('pathname').should('not.eq', RUTA);
  });

});