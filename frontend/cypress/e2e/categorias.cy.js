describe('Pruebas de Caja Negra - Cursos (UI)', () => {

  beforeEach(() => {
    // Interceptamos la llamada a la API para asegurar que los datos estén cargados antes de interactuar con el DOM
    cy.intercept('GET', '/api/cursos').as('getCursos');

    // Preparamos el localStorage y navegamos a la vista
    cy.visit('/cursos', {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          'usuario',
          JSON.stringify({
            id_cargo: 2
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

  it('CP-CUR-UI-04: Debe mostrar la tabla de cursos', () => {
    // Espera explícita a que la petición a la API responda
    cy.wait('@getCursos');

    // Verificación de la tabla
    cy.get('table').should('be.visible');
  });

});