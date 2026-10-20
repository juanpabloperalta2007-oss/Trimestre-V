describe('Pruebas de Caja Negra - Horario Semanal Docente (UI)', () => {

  const abrirHorarioComoDocente = (consulta = { curso: '10-01', anio: '2026' }) => {
    // Interceptamos la comprobación inicial del backend en App.js
    cy.intercept('GET', '**/api/mensaje', {
      statusCode: 200,
      body: { mensaje: 'OK' }
    });

    // Inyectamos la sesión y los datos de consulta en localStorage
    cy.visit('/horario', {
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
        win.localStorage.setItem('horarioConsulta', JSON.stringify(consulta));
      }
    });
  };

  it('CP-HORVIE-UI-01: Debe cargar la vista y mostrar el encabezado con los datos de consulta guardados', () => {
    const mockConsulta = { curso: '11-01', anio: '2026' };
    abrirHorarioComoDocente(mockConsulta);

    cy.url().should('include', '/horario');
    cy.contains('h2', 'Horario Semanal').should('be.visible');
    cy.contains('h5', 'Curso: 11-01 — 2026').should('be.visible');
  });

  it('CP-HORVIE-UI-02: Debe renderizar la tabla con las materias, docentes, receso y espacios libres', () => {
    abrirHorarioComoDocente();

    // Validar cabeceras de los días
    ['Hora', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].forEach((dia) => {
      cy.contains('th', dia).should('be.visible');
    });

    // Validar materias y docentes renderizados
    cy.contains('strong', 'Matemáticas').should('be.visible');
    cy.contains('small', 'Dr. Roberto Nazario').should('be.visible');
    cy.contains('strong', 'Programación').should('be.visible');
    cy.contains('small', 'Ing. Jose Lopez').should('be.visible');

    // Validar la fila especial de Receso Estudiantil
    cy.contains('td', 'Receso Estudiantil').should('be.visible');

    // Validar que existan bloques de Espacio Libre
    cy.contains('span', 'Espacio Libre').should('be.visible');
  });

  it('CP-HORVIE-UI-03: Debe redirigir a /consultar-horario al hacer clic en Nueva Consulta', () => {
    abrirHorarioComoDocente();

    cy.contains('a', 'Nueva Consulta').click();

    cy.url().should('include', '/consultar-horario');
  });

  it('CP-HORVIE-UI-04: Debe manejar la confirmación y alerta al eliminar un horario', () => {
    abrirHorarioComoDocente();

    // Asignamos stubs directos a la ventana ANTES de hacer clic
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true).as('confirmacion');
      cy.stub(win, 'alert').as('alertaNativa');
    });

    // Hacer clic en Eliminar Horario
    cy.contains('button', 'Eliminar Horario').click();

    // Validar que el confirm fue aceptado y la alerta ejecutada
    cy.get('@confirmacion').should('have.been.calledWith', '¿Eliminar este horario?');
    cy.get('@alertaNativa').should('have.been.calledWith', 'Horario eliminado (simulado)');
  });

});