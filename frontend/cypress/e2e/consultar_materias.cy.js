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
    cy.contains('Registro de Materias').should('be.visible');
    cy.contains('Nueva Materia').should('be.visible');
  });

  it('CP-MAT-UI-02: Debe guardar una materia exitosamente en localStorage y mostrar alerta', () => {
    abrirMateriasComoDocente();

    // 1. Asignamos el stub a la ventana antes de interactuar con los elementos
    let stubAlert;
    cy.window().then((win) => {
      stubAlert = cy.stub(win, 'alert').as('alertaNativa');
    });

    // 2. Diligenciamos el campo de texto y el select por valor ("1" para Activo)
    cy.get('input[placeholder="Ej: Programación"]').type('Bases de Datos');
    cy.get('select.form-select').select('1');

    // 3. Enviamos el formulario
    cy.contains('button', 'Guardar Materia').click();

    // 4. Confirmamos la llamada a la alerta con el mensaje exacto
    cy.get('@alertaNativa').should('have.been.calledWith', 'Materia guardada con éxito');

    // 5. Verificamos que los campos del componente se hayan reseteado
    cy.get('input[placeholder="Ej: Programación"]').should('have.value', '');

    // 6. Validamos que la información persista en localStorage
    cy.window().then((win) => {
      const misMaterias = JSON.parse(win.localStorage.getItem('misMaterias'));
      expect(misMaterias).to.be.an('array');
      expect(misMaterias[0]).to.deep.equal({ nombre: 'Bases de Datos', estado: '1' });
    });
  });

  it('CP-MAT-UI-03: Debe limpiar los campos al hacer clic en el botón Limpiar', () => {
    abrirMateriasComoDocente();

    // Escribimos valores temporales
    cy.get('input[placeholder="Ej: Programación"]').type('Física');
    cy.get('select.form-select').select('0');

    // Hacemos clic en Limpiar
    cy.contains('button', 'Limpiar').click();

    // Verificamos que el formulario quede vacío
    cy.get('input[placeholder="Ej: Programación"]').should('have.value', '');
    cy.get('select.form-select').should('have.value', null);
  });

  it('CP-MAT-UI-04: Debe redirigir a la vista de materias agregadas', () => {
    abrirMateriasComoDocente();

    // Hacemos clic en el enlace para ver las materias registradas
    cy.contains('a', 'Ver materias registradas').click();

    // Validamos la URL exacta configurada en el elemento <a>
    cy.url().should('include', '/materias-agregadas');
  });

});