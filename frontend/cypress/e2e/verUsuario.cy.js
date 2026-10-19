describe('Pruebas de Caja Negra - Ver Usuario (UI)', () => {

  const RUTA = '/ver_usuario';

  const usuarioAdmin = {
    id_cargo: 1,
    login: 'admin@liceo.edu.co',
    nombre: 'Andres Cypress',
    rol: 'Administrador'
  };

  // El tercer usuario no trae rol ni estado: sirve para probar los valores por defecto
  const usuariosMock = [
    { id_usuario: 1, login: 'ana@liceo.edu.co', estado: 'Activo', rol: 'Coordinador', id_cargo: 2 },
    { id_usuario: 2, login: 'luis@liceo.edu.co', estado: 'Inactivo', rol: 'Docente', id_cargo: 3 },
    { id_usuario: 3, login: 'maria@liceo.edu.co' }
  ];

  // Los labels no están vinculados a los inputs: se busca el campo dentro del mismo contenedor
  const campo = (etiqueta) => cy.contains('label', etiqueta).parent().find('input');
  const badgeEstado = () => cy.contains('label', 'Estado').parent().find('span.badge');

  const prepararSesion = (usuario = usuarioAdmin) => {
    cy.intercept('GET', '**/api/mensaje', { body: {} }); // evita el 404 de App.jsx
    cy.intercept('GET', '**/api/usuarios', { body: usuariosMock }).as('getUsuarios');
    return {
      onBeforeLoad(win) {
        win.localStorage.setItem('usuario', JSON.stringify(usuario));
      }
    };
  };

  // Flujo real: entrar a Vista Admin y pulsar "Ver" en la fila del usuario
  const visitarVer = (correoFila = 'ana@liceo.edu.co', usuario = usuarioAdmin) => {
    cy.visit('/vista_admin', prepararSesion(usuario));
    cy.wait('@getUsuarios');
    cy.contains('tr', correoFila).contains('button', 'Ver').click();
    cy.location('pathname').should('eq', RUTA);
  };

  // Acceso directo a la URL (sin pasar por la lista): la pantalla no recibe datos
  const visitarDirecto = (usuario = usuarioAdmin) => {
    cy.visit(RUTA, prepararSesion(usuario));
  };

  // ============================================
  // CASOS BÁSICOS
  // ============================================
  it('CP-UI-01: Debe cargar la página de detalles del usuario', () => {
    visitarVer();
    cy.url().should('include', RUTA);
  });

  it('CP-UI-02: Debe mostrar el título "Detalles del Usuario"', () => {
    visitarVer();
    cy.contains('h2, h1', 'Detalles del Usuario').should('be.visible');
  });

  it('CP-UI-03: Debe mostrar la descripción de la pantalla', () => {
    visitarVer();
    cy.contains('Información detallada registrada en el sistema.').should('be.visible');
  });

  it('CP-UI-04: En esta pantalla ninguna opción del sidebar queda resaltada', () => {
    visitarVer();
    cy.get('.list-group a').should('have.length', 3);
    cy.get('.list-group a.active').should('not.exist');
  });

  // ============================================
  // ESTRUCTURA DE LA PANTALLA
  // ============================================
  it('CP-UI-05: Debe mostrar las etiquetas ID del Usuario, Correo / Login, Rol y Estado', () => {
    visitarVer();
    cy.contains('label', 'ID del Usuario').should('be.visible');
    cy.contains('label', 'Correo / Login').should('be.visible');
    cy.contains('label', 'Rol').should('be.visible');
    cy.contains('label', 'Estado').should('be.visible');
  });

  it('CP-UI-06: Los campos de información son de solo lectura', () => {
    visitarVer();
    cy.get('.card input').should('have.length', 3);
    cy.get('.card input').each(($input) => {
      expect($input).to.be.disabled;
    });
  });

  it('CP-UI-07: Debe mostrar los botones "Volver" e "Ir a Editar"', () => {
    visitarVer();
    cy.contains('button', 'Volver').should('be.visible').and('not.be.disabled');
    cy.contains('button', 'Ir a Editar').should('be.visible').and('not.be.disabled');
  });

  // ============================================
  // DATOS DEL USUARIO
  // ============================================
  it('CP-UI-08: Debe mostrar los datos del usuario seleccionado (Ana)', () => {
    visitarVer('ana@liceo.edu.co');
    campo('ID del Usuario').should('have.value', '1');
    campo('Correo / Login').should('have.value', 'ana@liceo.edu.co');
    campo('Rol').should('have.value', 'Coordinador');
    badgeEstado().should('have.text', 'Activo');
  });

  it('CP-UI-09: Debe mostrar los datos de otro usuario (Luis)', () => {
    visitarVer('luis@liceo.edu.co');
    campo('ID del Usuario').should('have.value', '2');
    campo('Correo / Login').should('have.value', 'luis@liceo.edu.co');
    campo('Rol').should('have.value', 'Docente');
    badgeEstado().should('have.text', 'Inactivo');
  });

  it('CP-UI-10: Un usuario Activo muestra el estado en verde', () => {
    visitarVer('ana@liceo.edu.co');
    badgeEstado().should('have.class', 'bg-success').and('not.have.class', 'bg-danger');
  });

  it('CP-UI-11: Un usuario Inactivo muestra el estado en rojo', () => {
    visitarVer('luis@liceo.edu.co');
    badgeEstado().should('have.class', 'bg-danger').and('not.have.class', 'bg-success');
  });

  it('CP-UI-12: Si el usuario no trae rol ni estado, muestra "Profesor" y "Activo" por defecto', () => {
    visitarVer('maria@liceo.edu.co');
    campo('Correo / Login').should('have.value', 'maria@liceo.edu.co');
    campo('Rol').should('have.value', 'Profesor');
    badgeEstado().should('have.text', 'Activo');
  });

  it('CP-UI-13: Entrando directo a la URL, muestra N/A en ID y correo', () => {
    visitarDirecto();
    campo('ID del Usuario').should('have.value', 'N/A');
    campo('Correo / Login').should('have.value', 'N/A');
    campo('Rol').should('have.value', 'Profesor');
    badgeEstado().should('have.text', 'Activo');
  });

  // ============================================
  // NAVEGACIÓN
  // ============================================
  it('CP-UI-14: "Volver" regresa a /vista_admin', () => {
    visitarVer();
    cy.contains('button', 'Volver').click();
    cy.location('pathname').should('eq', '/vista_admin');
    cy.contains('td', 'ana@liceo.edu.co').should('be.visible');
  });

  it('CP-UI-15: "Ir a Editar" lleva a /editar_usuario con los datos del usuario', () => {
    visitarVer('ana@liceo.edu.co');
    cy.contains('button', 'Ir a Editar').click();

    cy.location('pathname').should('eq', '/editar_usuario');
    cy.contains('h2, h1', 'Editar Usuario').should('be.visible');
    cy.contains('label', 'Correo / Login').parent().find('input')
      .should('have.value', 'ana@liceo.edu.co');
    cy.contains('label', 'Cargo').parent().find('select').should('have.value', '2');
    cy.contains('label', 'Estado').parent().find('select').should('have.value', 'Activo');
  });

  it('CP-UI-16: "Ir a Editar" conserva el estado Inactivo del usuario', () => {
    visitarVer('luis@liceo.edu.co');
    cy.contains('button', 'Ir a Editar').click();

    cy.location('pathname').should('eq', '/editar_usuario');
    cy.contains('label', 'Correo / Login').parent().find('input')
      .should('have.value', 'luis@liceo.edu.co');
    cy.contains('label', 'Estado').parent().find('select').should('have.value', 'Inactivo');
  });

  // ============================================
  // CONTROL DE ACCESO
  // ============================================
  it('CP-UI-17: Sin sesión NO debe acceder (redirige al login)', () => {
    cy.visit(RUTA);
    cy.location('pathname').should('eq', '/');
  });

  it('CP-UI-18: Un docente (cargo 3) NO debe acceder a ver usuario', () => {
    visitarDirecto({ id_cargo: 3, nombre: 'Docente Test', rol: 'Docente' });
    cy.location('pathname').should('not.eq', RUTA);
  });

  it('CP-UI-19: Un acudiente (cargo 4) NO debe acceder a ver usuario', () => {
    visitarDirecto({ id_cargo: 4, nombre: 'Acudiente Test', rol: 'Acudiente' });
    cy.location('pathname').should('not.eq', RUTA);
  });

  it('CP-UI-20: Un coordinador (cargo 2) NO debe acceder a ver usuario', () => {
    visitarDirecto({ id_cargo: 2, nombre: 'Coordinador Test', rol: 'Coordinador' });
    cy.location('pathname').should('not.eq', RUTA);
  });

});