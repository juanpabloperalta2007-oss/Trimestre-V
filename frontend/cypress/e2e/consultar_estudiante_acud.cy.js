describe('Pruebas de Caja Negra - Consultar Estudiante Acudiente (UI)', () => {

  const abrirEstudiantesComoAcudiente = () => {
    // 1. Interceptamos la comprobación inicial del backend en App.js
    cy.intercept('GET', '**/api/mensaje', {
      statusCode: 200,
      body: { mensaje: 'OK' }
    });

    // 2. Interceptamos la petición de mis-estudiantes que realiza el componente
    cy.intercept('GET', '**/api/acudientes_estudiantes/mis-estudiantes/*', {
      statusCode: 200,
      body: [
        {
          id_estudiante: 1,
          primer_nombre: 'Jhoan',
          segundo_nombre: 'Luis',
          primer_apellido: 'Castro',
          segundo_apellido: 'Feria',
          nombre_curso: '601'
        }
      ]
    }).as('getEstudiantes');

    // 3. Inyectamos la sesión en localStorage con id_cargo: 4 (Acudiente) y visitamos la URL correcta
    cy.visit('/consultar-estudiante', {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          'usuario',
          JSON.stringify({
            id_usuario: 1,
            id_persona: 8,
            id_cargo: 4, // Exigido por RutaProtegida
            correo: 'laura.martinez@gmail.com'
          })
        );
      }
    });
  };

  it('CP-EST-UI-01: Debe cargar la página de consultar estudiantes', () => {
    abrirEstudiantesComoAcudiente();

    cy.url().should('include', '/consultar-estudiante');
    cy.get('body').should('be.visible');
  });

  it('CP-EST-UI-02: Debe mostrar el título CONSULTAR ESTUDIANTES', () => {
    abrirEstudiantesComoAcudiente();

    cy.contains('CONSULTAR ESTUDIANTES').should('be.visible');
  });

  it('CP-EST-UI-03: Debe mostrar la información del estudiante mockeado', () => {
    abrirEstudiantesComoAcudiente();

    // Esperamos a que la petición a la API responda
    cy.wait('@getEstudiantes');

    cy.contains('Jhoan Luis').should('be.visible');
    cy.contains('Castro Feria').should('be.visible');
    cy.contains('Curso 601').should('be.visible');
  });

  it('CP-EST-UI-04: Debe desplegar y ocultar las opciones al hacer clic en la tarjeta', () => {
    abrirEstudiantesComoAcudiente();
    cy.wait('@getEstudiantes');

    // Clic en la tarjeta del estudiante para desplegar
    cy.contains('Jhoan Luis').click();

    cy.contains('Estadísticas Mensuales de Asistencia').should('be.visible');
    cy.contains('Radicar Excusa / Justificación').should('be.visible');

    // Clic para contraer nuevamente
    cy.contains('Jhoan Luis').click();
    cy.contains('Estadísticas Mensuales de Asistencia').should('not.exist');
  });

  it('CP-EST-UI-05: Debe navegar hacia la vista de estadísticas', () => {
    abrirEstudiantesComoAcudiente();
    cy.wait('@getEstudiantes');

    cy.contains('Jhoan Luis').click();
    cy.contains('Estadísticas Mensuales de Asistencia').click();

    cy.url().should('include', '/acudiente/estadisticas');
  });

});