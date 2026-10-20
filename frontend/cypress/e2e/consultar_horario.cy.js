describe('Pruebas de Caja Negra - Consultar Horario Docente (UI)', () => {

  const abrirConsultarHorarioComoDocente = () => {
    // Interceptamos la comprobación inicial del backend en App.js
    cy.intercept('GET', '**/api/mensaje', {
      statusCode: 200,
      body: { mensaje: 'OK' }
    });

    // Inyectamos la sesión con id_cargo: 3 (Docente) y visitamos /consultar-horario
    cy.visit('/consultar-horario', {
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

  it('CP-HOR-UI-01: Debe cargar la página y mostrar los campos del formulario con valores por defecto', () => {
    abrirConsultarHorarioComoDocente();

    cy.url().should('include', '/consultar-horario');
    cy.contains('h2', 'Consultar Horario').should('be.visible');

    // Verificar valores por defecto de los inputs
    cy.get('input[type="number"]').should('have.value', '2026');
    cy.get('input[type="time"]').first().should('have.value', '07:00');
    cy.get('input[type="time"]').last().should('have.value', '12:00');
  });

  it('CP-HOR-UI-02: Debe permitir seleccionar un curso y modificar los campos de filtro', () => {
    abrirConsultarHorarioComoDocente();

    // Seleccionar curso
    cy.get('select.form-select').select('10-01');
    cy.get('select.form-select').should('have.value', '10-01');

    // Modificar año y horas
    cy.get('input[type="number"]').clear().type('2026');
    cy.get('input[type="time"]').first().clear().type('08:00');
    cy.get('input[type="time"]').last().clear().type('13:00');

    cy.get('input[type="number"]').should('have.value', '2026');
    cy.get('input[type="time"]').first().should('have.value', '08:00');
    cy.get('input[type="time"]').last().should('have.value', '13:00');
  });

  it('CP-HOR-UI-03: Debe redirigir a la vista de horario al hacer clic en Ver Horario', () => {
    abrirConsultarHorarioComoDocente();

    // Seleccionar curso antes de navegar
    cy.get('select.form-select').select('11-01');

    // Clic en el enlace de Ver Horario
    cy.contains('a', 'Ver Horario').click();

    // Validar la redirección respetando la H mayúscula del href del componente
    cy.url().should('include', '/Horario');
  });

  it('CP-HOR-UI-04: Debe guardar la consulta en localStorage si se procesa el formulario', () => {
    abrirConsultarHorarioComoDocente();

    // Seleccionar curso y enviar el formulario mediante el evento submit
    cy.get('select.form-select').select('10-01');
    cy.get('form').submit();

    // Verificar que los datos de la consulta persistan en localStorage
    cy.window().then((win) => {
      const consultaGuardada = JSON.parse(win.localStorage.getItem('horarioConsulta'));
      expect(consultaGuardada).to.deep.equal({
        curso: '10-01',
        anio: '2026',
        horaInicio: '07:00',
        horaFin: '12:00'
      });
    });
  });

});