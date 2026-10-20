describe('Pruebas de Caja Negra - Materias Agregadas Docente (UI)', () => {

  const abrirMateriasAgregadasComoDocente = (materiasIniciales = []) => {
    // Interceptamos la comprobación inicial del backend en App.js
    cy.intercept('GET', '**/api/mensaje', {
      statusCode: 200,
      body: { mensaje: 'OK' }
    });

    // Inyectamos la sesión y los datos iniciales de materias en localStorage
    cy.visit('/materias-agregadas', {
      onBeforeLoad(win) {
        win.localStorage.clear();
        win.localStorage.setItem(
          'usuario',
          JSON.stringify({
            id_usuario: 6,
            id_persona: 6,
            id_cargo: 3, // Docente
            correo: 'jorge5000@gmail.com'
          })
        );
        win.localStorage.setItem('misMaterias', JSON.stringify(materiasIniciales));
      }
    });
  };

  it('CP-MATAGR-UI-01: Debe mostrar un mensaje de tabla vacía cuando no hay materias guardadas', () => {
    abrirMateriasAgregadasComoDocente([]);

    cy.url().should('include', '/materias-agregadas');
    cy.contains('h2', 'Materias Registradas').should('be.visible');
    cy.contains('td', 'No hay materias registradas').should('be.visible');
  });

  it('CP-MATAGR-UI-02: Debe desplegar la lista de materias guardadas en localStorage', () => {
    const mockMaterias = [
      { nombre: 'Programación', estado: '1' },
      { nombre: 'Bases de Datos', estado: '0' }
    ];

    abrirMateriasAgregadasComoDocente(mockMaterias);

    // Fila 1: Programación - Activo - Código 1
    cy.contains('tr', 'Programación').within(() => {
      cy.contains('Activo').should('be.visible');
      cy.contains('1').should('be.visible');
      cy.contains('button', 'Eliminar').should('be.visible');
    });

    // Fila 2: Bases de Datos - Inactivo - Código 2
    cy.contains('tr', 'Bases de Datos').within(() => {
      cy.contains('Inactivo').should('be.visible');
      cy.contains('2').should('be.visible');
      cy.contains('button', 'Eliminar').should('be.visible');
    });
  });

  it('CP-MATAGR-UI-03: Debe eliminar una materia de la lista y actualizar localStorage', () => {
    const mockMaterias = [
      { nombre: 'Física', estado: '1' },
      { nombre: 'Química', estado: '1' }
    ];

    abrirMateriasAgregadasComoDocente(mockMaterias);

    // Eliminar 'Física'
    cy.contains('tr', 'Física').find('button.btn-danger').click();

    // Comprobar que ya no aparece en la interfaz
    cy.contains('Física').should('not.exist');
    cy.contains('Química').should('be.visible');

    // Verificar actualización en localStorage
    cy.window().then((win) => {
      const listaActualizada = JSON.parse(win.localStorage.getItem('misMaterias'));
      expect(listaActualizada).to.have.lengthOf(1);
      expect(listaActualizada[0].nombre).to.equal('Química');
    });
  });

  it('CP-MATAGR-UI-04: Debe navegar de regreso al formulario de materias', () => {
    abrirMateriasAgregadasComoDocente([]);

    cy.contains('a', 'Volver').click();

    cy.url().should('include', '/materias');
  });

});