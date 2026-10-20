describe('Pruebas de Caja Negra - Cursos (UI)', () => {

  beforeEach(() => {
    // Interceptamos la llamada /api/cursos mockeando la respuesta
    cy.intercept('GET', '/api/cursos', {
      statusCode: 200,
      body: [
        { id_curso: 1, nombre_curso: '601', estado: 'Activo' },
        { id_curso: 2, nombre_curso: '602', estado: 'Activo' },
        { id_curso: 3, nombre_curso: '701', estado: 'Activo' },
        { id_curso: 4, nombre_curso: '702', estado: 'Activo' },
        { id_curso: 5, nombre_curso: '801', estado: 'Activo' },
        { id_curso: 6, nombre_curso: '802', estado: 'Activo' }
      ]
    }).as('getCursos');

    // Inyectamos la sesión en localStorage y visitamos la vista
    cy.visit('/cursos', {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          'usuario',
          JSON.stringify({
            id_usuario: 3,
            id_cargo: 2,
            correo: 'jhoanferia@gmail.com'
          })
        );
      }
    });
  });

  it('CP-CUR-UI-01: Debe cargar la página de cursos', () => {
    cy.url().should('include', '/cursos');
    cy.get('body').should('be.visible');
  });

  it('CP-CUR-UI-02: Debe mostrar el título Consultar Cursos', () => {
    cy.contains('Consultar Cursos').should('be.visible');
  });

  it('CP-CUR-UI-03: Debe mostrar el mensaje informativo del coordinador', () => {
    cy.contains(
      'El coordinador puede acceder a cualquier curso y eliminar inasistencias injustificadas.'
    ).should('be.visible');
  });

  it('CP-CUR-UI-04: Debe desplegar la lista de cursos disponibles', () => {
    cy.wait('@getCursos');

    // 1. Verificamos que el menú desplegable (select) esté visible
    cy.get('select').should('be.visible');

    // 2. Verificamos que las opciones existan dentro del select (se usa 'exist' en lugar de 'be.visible')
    cy.contains('option', '601').should('exist');
    cy.contains('option', '802').should('exist');
  });

});