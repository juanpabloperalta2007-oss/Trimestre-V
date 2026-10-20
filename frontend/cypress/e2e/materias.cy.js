describe('Pruebas de Caja Negra - Registro de Materias Docente (UI)', () => {

  const abrirMateriasComoDocente = () => {
    // Interceptamos la comprobación inicial del backend en App.js
    cy.intercept('GET', '**/api/mensaje', {
      statusCode: 200,
      body: { mensaje: 'OK' }
    });

    // Inyectamos la sesión en localStorage con id_cargo: 3 (Docente)
    cy.visit('/materias', {
      onBeforeLoad(win) {
        win.localStorage.clear();
        win.localStorage.setItem(
          'usuario',
          JSON.stringify({
            id_usuario: 6,
            id_persona: 6,
            id_cargo: 3, // Exigido por RutaProtegida
            correo: 'jorge5000@gmail.com'
          })
        );
      }
    });
  };

  it('CP-MAT-UI-01: Debe cargar la página y mostrar el formulario de Registro de Materias', () => {
    abrirMateriasComoDocente();

    cy.url().should('include', '/materias');
    cy.contains('h2', 'Registro de Materias').should('be.visible');
    cy.contains('h4', 'Nueva Materia').should('be.visible');
  });

  it('CP-MAT-UI-02: Debe guardar una materia exitosamente en localStorage y mostrar alerta', () => {
    abrirMateriasComoDocente();

    // 1. Asignamos el stub a la ventana antes de enviar el formulario
    let stubAlert;
    cy.window().then((win) => {
      stubAlert = cy.stub(win, 'alert').as('alertaNativa');
    });

    // 2. Diligenciar el formulario
    cy.get('input[placeholder="Ej: Programación"]').type('Programación Web');
    cy.get('select.form-select').select('1');

    // 3. Enviar el formulario
    cy.contains('button', 'Guardar Materia').click();

    // 4. Validar la llamada a la alerta con el mensaje de confirmación
    cy.get('@alertaNativa').should('have.been.calledWith', 'Materia guardada con éxito');

    // 5. Verificar reseteo de los campos
    cy.get('input[placeholder="Ej: Programación"]').should('have.value', '');

    // 6. Validar persistencia en localStorage
    cy.window().then((win) => {
      const misMaterias = JSON.parse(win.localStorage.getItem('misMaterias'));
      expect(misMaterias).to.be.an('array');
      expect(misMaterias[0]).to.deep.equal({ nombre: 'Programación Web', estado: '1' });
    });
  });

  it('CP-MAT-UI-03: Debe limpiar los campos al hacer clic en el botón Limpiar', () => {
    abrirMateriasComoDocente();

    // Diligenciar valores temporales
    cy.get('input[placeholder="Ej: Programación"]').type('Física Relativista');
    cy.get('select.form-select').select('0');

    // Hacer clic en Limpiar
    cy.contains('button', 'Limpiar').click();

    // Validar reseteo
    cy.get('input[placeholder="Ej: Programación"]').should('have.value', '');
    cy.get('select.form-select').should('have.value', null);
  });

  it('CP-MAT-UI-04: Debe redirigir a la vista de materias agregadas', () => {
    abrirMateriasComoDocente();

    // Clic en el enlace de ver materias registradas
    cy.contains('a', 'Ver materias registradas').click();

    // Verificar redirección
    cy.url().should('include', '/materias-agregadas');
  });

});