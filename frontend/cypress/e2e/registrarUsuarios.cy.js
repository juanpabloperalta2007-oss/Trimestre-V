describe('Pruebas de Caja Negra - Registrar Usuario (UI)', () => {

  const RUTA = '/registrar_usuario';

  const usuarioAdmin = {
    id_cargo: 1,
    login: 'admin@liceo.edu.co',
    nombre: 'Andres Cypress',
    rol: 'Administrador'
  };

  const MSG_OBLIGATORIO = 'Por favor complete todos los campos obligatorios (*).';
  const MSG_PASSWORD_FORMATO =
    'La contraseña debe contener letras y números, sin espacios ni caracteres especiales.';

  // Los labels del formulario no están vinculados a los inputs: se busca por "name"
  const campo = (nombre) => cy.get(`[name="${nombre}"]`);

  const enviar = () => cy.contains('button', 'Registrar Usuario').click();

  // Simula sesión iniciada. Se intercepta GET /api/usuarios porque tras registrar
  // la app navega a /vista_admin, que carga la lista de usuarios.
  const visitarConSesion = (usuario = usuarioAdmin) => {
    cy.intercept('GET', '**/api/mensaje', { body: {} }); // evita el 404 de App.jsx
    cy.intercept('GET', '**/api/usuarios', { body: [] });
    cy.visit(RUTA, {
      onBeforeLoad(win) {
        win.localStorage.setItem('usuario', JSON.stringify(usuario));
      }
    });
  };

  const interceptarRegistro = (respuesta = { statusCode: 201, body: { mensaje: 'ok' } }) => {
    cy.intercept('POST', '**/api/usuarios/registro-admin', respuesta).as('registro');
  };

  // Llena solo los campos obligatorios (se pueden sobrescribir valores)
  const llenarObligatorios = (cambios = {}) => {
    const datos = {
      primer_nombre: 'Carlos',
      primer_apellido: 'Pérez',
      numero_documento: '1012345678',
      correo: 'carlos.perez@liceo.edu.co',
      password: 'Clave1234',
      ...cambios
    };
    Object.entries(datos).forEach(([nombre, valor]) => campo(nombre).type(valor));
  };

  // Escribe un valor y verifica que el campo se marque con el error esperado
  const verificarError = (nombre, valor, mensaje) => {
    campo(nombre).type(valor);
    campo(nombre).should('have.class', 'is-invalid');
    cy.contains('.invalid-feedback', mensaje).should('be.visible');
  };

  // ============================================
  // CASOS BÁSICOS
  // ============================================
  it('CP-UI-01: Debe cargar la página de registrar usuario', () => {
    visitarConSesion();
    cy.url().should('include', RUTA);
  });

  it('CP-UI-02: Debe mostrar el título "REGISTRAR NUEVO USUARIO"', () => {
    visitarConSesion();
    cy.contains('h4, h2, h1', 'REGISTRAR NUEVO USUARIO').should('be.visible');
  });

  it('CP-UI-03: Debe mostrar la descripción de la pantalla', () => {
    visitarConSesion();
    cy.contains('Ingrese los datos para dar de alta a un Coordinador, Docente o Administrador.')
      .should('be.visible');
  });

  // ============================================
  // SIDEBAR
  // ============================================
  it('CP-UI-04: En /registrar_usuario, la opción "Registrar Usuario" queda resaltada', () => {
    visitarConSesion();
    cy.contains('.list-group a', 'Registrar Usuario').should('have.class', 'active');
    cy.contains('.list-group a', 'Inicio').should('not.have.class', 'active');
  });

  it('CP-UI-05: "Inicio" del sidebar debe llevar a /vista_admin', () => {
    visitarConSesion();
    cy.contains('.list-group a', 'Inicio').click();
    cy.location('pathname').should('eq', '/vista_admin');
  });

  // ============================================
  // ESTRUCTURA DEL FORMULARIO
  // ============================================
  it('CP-UI-06: Debe mostrar las etiquetas de los campos (obligatorios con *)', () => {
    visitarConSesion();
    ['Primer Nombre', 'Primer Apellido', 'Tipo Documento', 'Número Documento',
     'Correo / Login', 'Contraseña', 'Cargo / Rol a Asignar'].forEach((texto) => {
      cy.contains('label', texto).should('be.visible').and('contain', '*');
    });
    ['Segundo Nombre', 'Segundo Apellido', 'Teléfono'].forEach((texto) => {
      cy.contains('label', texto).should('be.visible').and('not.contain', '*');
    });
  });

  it('CP-UI-07: Debe tener 8 campos de texto y 2 listas desplegables', () => {
    visitarConSesion();
    cy.get('form input').should('have.length', 8);
    cy.get('form select').should('have.length', 2);
  });

  it('CP-UI-08: Debe mostrar valores por defecto (CC, Coordinador, resto vacío)', () => {
    visitarConSesion();
    campo('tipo_documento').should('have.value', 'CC');
    campo('id_cargo').should('have.value', '2');
    ['primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido',
     'numero_documento', 'telefono', 'correo', 'password'].forEach((nombre) => {
      campo(nombre).should('have.value', '');
    });
  });

  it('CP-UI-09: El cargo debe ofrecer Coordinador, Administrador y Docente', () => {
    visitarConSesion();
    campo('id_cargo').find('option').should('have.length', 3);
    campo('id_cargo')
      .should('contain', 'Coordinador')
      .and('contain', 'Administrador')
      .and('contain', 'Docente')
      .and('not.contain', 'Acudiente');
  });

  it('CP-UI-10: El tipo de documento debe ofrecer CC, CE y TI', () => {
    visitarConSesion();
    campo('tipo_documento').find('option').should('have.length', 3);
    campo('tipo_documento')
      .should('contain', 'Cédula de Ciudadanía')
      .and('contain', 'Cédula de Extranjería')
      .and('contain', 'Tarjeta de Identidad');
  });

  it('CP-UI-11: El campo contraseña debe ocultar lo que se escribe', () => {
    visitarConSesion();
    campo('password').should('have.attr', 'type', 'password');
  });

  it('CP-UI-12: Debe mostrar el botón "Registrar Usuario" habilitado', () => {
    visitarConSesion();
    cy.contains('button', 'Registrar Usuario').should('be.visible').and('not.be.disabled');
  });

  // ============================================
  // VALIDACIÓN AL ENVIAR
  // ============================================
  it('CP-UI-13: Enviar el formulario vacío marca los 5 campos obligatorios', () => {
    interceptarRegistro();
    visitarConSesion();
    enviar();
    cy.get('.invalid-feedback').should('have.length', 5);
    cy.get('.invalid-feedback').each(($el) => {
      expect($el.text()).to.eq(MSG_OBLIGATORIO);
    });
  });

  it('CP-UI-14: Enviar el formulario vacío NO debe llamar al backend', () => {
    interceptarRegistro();
    visitarConSesion();
    enviar();
    cy.contains('.invalid-feedback', MSG_OBLIGATORIO).should('be.visible');
    cy.get('@registro.all').should('have.length', 0);
  });

  it('CP-UI-15: Un solo campo inválido debe bloquear el envío', () => {
    interceptarRegistro();
    visitarConSesion();
    llenarObligatorios({ correo: 'correo-invalido' });
    enviar();
    cy.contains('.invalid-feedback', 'Ingrese un correo electrónico válido.').should('be.visible');
    cy.get('@registro.all').should('have.length', 0);
  });

  // ============================================
  // NOMBRES Y APELLIDOS
  // ============================================
  it('CP-UI-16: El primer nombre no acepta números', () => {
    visitarConSesion();
    verificarError('primer_nombre', 'Carlos123', 'El primer nombre solo puede contener letras.');
  });

  it('CP-UI-17: El segundo nombre no acepta números', () => {
    visitarConSesion();
    verificarError('segundo_nombre', 'Andres9', 'El segundo nombre solo puede contener letras.');
  });

  it('CP-UI-18: El primer apellido no acepta números', () => {
    visitarConSesion();
    verificarError('primer_apellido', 'Perez1', 'El primer apellido solo puede contener letras.');
  });

  it('CP-UI-19: El segundo apellido no acepta símbolos', () => {
    visitarConSesion();
    verificarError('segundo_apellido', 'Gomez#', 'El segundo apellido solo puede contener letras.');
  });

  it('CP-UI-20: Los nombres aceptan tildes, ñ y espacios', () => {
    visitarConSesion();
    campo('primer_nombre').type('María José');
    campo('primer_apellido').type('Muñoz Núñez');
    campo('primer_nombre').should('not.have.class', 'is-invalid');
    campo('primer_apellido').should('not.have.class', 'is-invalid');
  });

  it('CP-UI-21: Borrar un campo obligatorio muestra el error de campo requerido', () => {
    visitarConSesion();
    campo('primer_nombre').type('a').clear();
    campo('primer_nombre').should('have.class', 'is-invalid');
    cy.contains('.invalid-feedback', MSG_OBLIGATORIO).should('be.visible');
  });

  it('CP-UI-22: Corregir un valor inválido hace desaparecer el error', () => {
    visitarConSesion();
    verificarError('correo', 'correo-invalido', 'Ingrese un correo electrónico válido.');
    campo('correo').clear().type('ana@liceo.edu.co');
    campo('correo').should('not.have.class', 'is-invalid');
    cy.contains('.invalid-feedback', 'Ingrese un correo electrónico válido.').should('not.exist');
  });

  // ============================================
  // NÚMERO DE DOCUMENTO
  // ============================================
  it('CP-UI-23: El número de documento no acepta letras', () => {
    visitarConSesion();
    verificarError('numero_documento', 'abc123', 'El número de documento debe contener solo dígitos.');
  });

  it('CP-UI-24: El número de documento no acepta menos de 6 dígitos', () => {
    visitarConSesion();
    verificarError('numero_documento', '12345', 'El número de documento debe tener entre 6 y 15 dígitos.');
  });

  it('CP-UI-25: El número de documento no acepta más de 15 dígitos', () => {
    visitarConSesion();
    verificarError('numero_documento', '1234567890123456', 'El número de documento debe tener entre 6 y 15 dígitos.');
  });

  // ============================================
  // TELÉFONO (opcional)
  // ============================================
  it('CP-UI-26: El teléfono no acepta letras', () => {
    visitarConSesion();
    verificarError('telefono', 'abc1234', 'El teléfono debe contener únicamente números.');
  });

  it('CP-UI-27: El teléfono no acepta menos de 7 dígitos', () => {
    visitarConSesion();
    verificarError('telefono', '300123', 'El teléfono debe tener entre 7 y 10 dígitos.');
  });

  it('CP-UI-28: El teléfono no acepta más de 10 dígitos', () => {
    visitarConSesion();
    verificarError('telefono', '30012345678', 'El teléfono debe tener entre 7 y 10 dígitos.');
  });

  it('CP-UI-29: El teléfono es opcional: dejarlo vacío no muestra error', () => {
    visitarConSesion();
    campo('telefono').type('3001234567').clear();
    campo('telefono').should('not.have.class', 'is-invalid');
  });

  // ============================================
  // CORREO
  // ============================================
  it('CP-UI-30: El correo sin formato válido muestra error', () => {
    visitarConSesion();
    verificarError('correo', 'correo-invalido', 'Ingrese un correo electrónico válido.');
  });

  it('CP-UI-31: El correo sin dominio (a@b) muestra error', () => {
    visitarConSesion();
    verificarError('correo', 'ana@liceo', 'Ingrese un correo electrónico válido.');
  });

  // ============================================
  // CONTRASEÑA
  // ============================================
  it('CP-UI-32: La contraseña de menos de 8 caracteres muestra error', () => {
    visitarConSesion();
    verificarError('password', 'Abc123', 'La contraseña debe tener entre 8 y 20 caracteres.');
  });

  it('CP-UI-33: La contraseña de más de 20 caracteres muestra error', () => {
    visitarConSesion();
    verificarError('password', 'Clave1234567890123456', 'La contraseña debe tener entre 8 y 20 caracteres.');
  });

  it('CP-UI-34: La contraseña solo con letras muestra error', () => {
    visitarConSesion();
    verificarError('password', 'abcdefgh', MSG_PASSWORD_FORMATO);
  });

  it('CP-UI-35: La contraseña con caracteres especiales muestra error', () => {
    visitarConSesion();
    verificarError('password', 'Abc123!@', MSG_PASSWORD_FORMATO);
  });

  it('CP-UI-36: La contraseña con espacios muestra error', () => {
    visitarConSesion();
    verificarError('password', 'Clave 1234', MSG_PASSWORD_FORMATO);
  });

  // ============================================
  // ENVÍO EXITOSO
  // ============================================
  it('CP-UI-37: Debe enviar todos los datos del formulario al backend', () => {
    interceptarRegistro();
    visitarConSesion();

    llenarObligatorios();
    campo('segundo_nombre').type('Andrés');
    campo('segundo_apellido').type('Gómez');
    campo('telefono').type('3001234567');
    enviar();

    cy.wait('@registro').then(({ request }) => {
      expect(request.method).to.eq('POST');
      expect(request.body).to.deep.equal({
        primer_nombre: 'Carlos',
        segundo_nombre: 'Andrés',
        primer_apellido: 'Pérez',
        segundo_apellido: 'Gómez',
        tipo_documento: 'CC',
        numero_documento: '1012345678',
        telefono: '3001234567',
        correo: 'carlos.perez@liceo.edu.co',
        password: 'Clave1234',
        id_cargo: 2
      });
    });
  });

  it('CP-UI-38: Al elegir "Docente" debe enviar el cargo 3', () => {
    interceptarRegistro();
    visitarConSesion();

    llenarObligatorios();
    campo('id_cargo').select('Docente');
    campo('tipo_documento').select('Cédula de Extranjería');
    enviar();

    cy.wait('@registro').then(({ request }) => {
      expect(Number(request.body.id_cargo)).to.eq(3);
      expect(request.body.tipo_documento).to.eq('CE');
    });
  });

  it('CP-UI-39: Al registrar muestra el aviso de éxito y redirige a /vista_admin', () => {
    const alerta = cy.stub().as('alerta');
    cy.on('window:alert', alerta);

    interceptarRegistro();
    visitarConSesion();
    llenarObligatorios();
    enviar();

    cy.wait('@registro');
    cy.get('@alerta').should('have.been.calledWith', '¡Usuario registrado con éxito!');
    cy.location('pathname').should('eq', '/vista_admin');
  });

  it('CP-UI-40: Se puede registrar solo con los campos obligatorios', () => {
    interceptarRegistro();
    visitarConSesion();

    llenarObligatorios();
    enviar();

    cy.wait('@registro').then(({ request }) => {
      expect(request.body.segundo_nombre).to.eq('');
      expect(request.body.segundo_apellido).to.eq('');
      expect(request.body.telefono).to.eq('');
    });
    cy.location('pathname').should('eq', '/vista_admin');
  });

  it('CP-UI-41: Mientras se registra, el botón muestra "Registrando..." y se deshabilita', () => {
    interceptarRegistro({ statusCode: 201, body: {}, delay: 1000 });
    visitarConSesion();

    llenarObligatorios();
    enviar();

    cy.contains('button', 'Registrando...').should('be.disabled');
    cy.wait('@registro');
  });

  // ============================================
  // ERRORES DEL SERVIDOR
  // ============================================
  it('CP-UI-42: Si el servidor responde con error, lo muestra y no redirige', () => {
    const alerta = cy.stub().as('alerta');
    cy.on('window:alert', alerta);

    interceptarRegistro({ statusCode: 400, body: { error: 'El correo ya está registrado.' } });
    visitarConSesion();
    llenarObligatorios();
    enviar();

    cy.wait('@registro');
    cy.get('.alert-danger').should('be.visible').and('contain', 'El correo ya está registrado.');
    cy.location('pathname').should('eq', RUTA);
    cy.get('@alerta').should('not.have.been.called');
    cy.contains('button', 'Registrar Usuario').should('not.be.disabled');
  });

  it('CP-UI-43: Si el servidor falla sin mensaje (500), muestra el error genérico', () => {
    interceptarRegistro({ statusCode: 500, body: {} });
    visitarConSesion();
    llenarObligatorios();
    enviar();

    cy.wait('@registro');
    cy.get('.alert-danger').should('contain', 'Error al conectar con el servidor.');
    cy.location('pathname').should('eq', RUTA);
  });

  it('CP-UI-44: Sin conexión con el backend, muestra el error genérico', () => {
    interceptarRegistro({ forceNetworkError: true });
    visitarConSesion();
    llenarObligatorios();
    enviar();

    cy.get('.alert-danger').should('contain', 'Error al conectar con el servidor.');
    cy.location('pathname').should('eq', RUTA);
  });

  // ============================================
  // CONTROL DE ACCESO
  // ============================================
  it('CP-UI-45: Sin sesión NO debe acceder (redirige al login)', () => {
    cy.visit(RUTA);
    cy.location('pathname').should('eq', '/');
  });

  it('CP-UI-46: Un docente (cargo 3) NO debe acceder a registrar usuario', () => {
    visitarConSesion({ id_cargo: 3, nombre: 'Docente Test', rol: 'Docente' });
    cy.location('pathname').should('not.eq', RUTA);
  });

  it('CP-UI-47: Un acudiente (cargo 4) NO debe acceder a registrar usuario', () => {
    visitarConSesion({ id_cargo: 4, nombre: 'Acudiente Test', rol: 'Acudiente' });
    cy.location('pathname').should('not.eq', RUTA);
  });

  it('CP-UI-48: Un coordinador (cargo 2) NO debe acceder a registrar usuario', () => {
    visitarConSesion({ id_cargo: 2, nombre: 'Coordinador Test', rol: 'Coordinador' });
    cy.location('pathname').should('not.eq', RUTA);
  });

});