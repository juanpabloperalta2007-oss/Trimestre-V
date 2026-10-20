describe('Pruebas de Caja Negra - Llamar Lista (UI)', () => {

  beforeEach(() => {
    cy.on('window:confirm', () => true);
    cy.on('window:alert', () => true);

    // 1. Interceptar el mensaje inicial del backend
    cy.intercept('GET', '**/api/mensaje', {
      statusCode: 200,
      body: { mensaje: 'OK' }
    });

    // 2. Inyectar sesión de Docente (id_cargo: 3) requerida por RutaProtegida
    cy.visit('/llamar-lista', {
      onBeforeLoad(win) {
        win.localStorage.clear();
        win.localStorage.setItem(
          'usuario',
          JSON.stringify({
            id_usuario: 6,
            id_persona: 6,
            id_cargo: 3,
            correo: 'docente@colegio.com'
          })
        );
      }
    });
  });

  // ============================================
  // CASOS BÁSICOS
  // ============================================
  it('CP-UI-01: Debe cargar la página de llamar lista', () => {
    cy.url().should('include', '/llamar-lista');
  });

  it('CP-UI-02: Debe mostrar el título "Registrar asistencia"', () => {
    cy.contains('h5, h4, h2', 'Registrar asistencia').should('be.visible');
  });

  // ============================================
  // CASOS DE CONSULTA Y CARGA DE DATOS
  // ============================================
  it('CP-UI-03: Debe cargar los estudiantes de una materia desde el backend', () => {
    cy.intercept('GET', '**/api/**', {
      statusCode: 200,
      body: [
        {
          id_estudiante: 1,
          numero_documento: '101010',
          primer_nombre: 'Carlos',
          primer_apellido: 'Mendoza',
          estado: 'P',
          observaciones: ''
        },
        {
          id_estudiante: 2,
          numero_documento: '202020',
          primer_nombre: 'Ana',
          primer_apellido: 'Gómez',
          estado: 'A',
          observaciones: ''
        }
      ]
    }).as('getLista');

    cy.get('input[type="number"]').clear({ force: true }).type('2', { force: true });
    cy.contains('button', 'Cargar lista').click({ force: true });

    cy.wait('@getLista');
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
    cy.contains('Carlos Mendoza').should('be.visible');
  });

  it('CP-UI-04: NO debe cargar la lista si el código de materia es inválido', () => {
    cy.get('input[type="number"]').clear({ force: true }).type('-1', { force: true });
    cy.contains('button', 'Cargar lista').click({ force: true });

    cy.contains('Debe ingresar un código válido de materia o curso.').should('be.visible');
    cy.get('table').should('not.exist');
  });

  // ============================================
  // CASOS DE INTERACCIÓN Y EDICIÓN EN TABLA
  // ============================================
  it('CP-UI-05: Debe permitir cambiar el estado individual de asistencia de un estudiante', () => {
    cy.intercept('GET', '**/api/**', {
      statusCode: 200,
      body: [
        {
          id_estudiante: 1,
          numero_documento: '101010',
          primer_nombre: 'Carlos',
          primer_apellido: 'Mendoza',
          estado: 'P',
          observaciones: ''
        }
      ]
    }).as('getLista');

    cy.get('input[type="number"]').clear({ force: true }).type('2', { force: true });
    cy.contains('button', 'Cargar lista').click({ force: true });
    cy.wait('@getLista');

    cy.get('table tbody tr').first().within(() => {
      cy.contains('button', 'Tardía').click({ force: true });
    });

    cy.contains('Tardías').parent().contains('1').should('be.visible');
  });

  it('CP-UI-06: Debe marcar a todos los estudiantes como Presentes de forma masiva', () => {
    cy.intercept('GET', '**/api/**', {
      statusCode: 200,
      body: [
        { id_estudiante: 1, primer_nombre: 'Carlos', primer_apellido: 'Mendoza', estado: 'A' },
        { id_estudiante: 2, primer_nombre: 'Ana', primer_apellido: 'Gómez', estado: 'A' }
      ]
    }).as('getLista');

    cy.get('input[type="number"]').clear({ force: true }).type('2', { force: true });
    cy.contains('button', 'Cargar lista').click({ force: true });
    cy.wait('@getLista');

    cy.get('table tbody tr').then(($filas) => {
      const totalEstudiantes = $filas.length;

      cy.contains('button', 'Todos presentes').click({ force: true });

      cy.contains('Presentes').parent().contains(totalEstudiantes).should('be.visible');
    });
  });

  // ============================================
  // CASO DE GUARDADO / ENVÍO (CORREGIDO)
  // ============================================
  it('CP-UI-07: Debe enviar y guardar la asistencia en el backend correctamente', () => {
    // 1. Interceptamos la carga inicial y la recarga posterior
    cy.intercept('GET', '**/api/**', {
      statusCode: 200,
      body: [
        { id_estudiante: 1, primer_nombre: 'Carlos', primer_apellido: 'Mendoza', estado: 'P' }
      ]
    }).as('getLista');

    // 2. Interceptamos la petición POST para el guardado
    cy.intercept('POST', '**/api/**', {
      statusCode: 200,
      body: { mensaje: 'Asistencia registrada con éxito' }
    }).as('guardarAsistencia');

    // Cargar la lista inicial
    cy.get('input[type="number"]').clear({ force: true }).type('2', { force: true });
    cy.contains('button', 'Cargar lista').click({ force: true });
    cy.wait('@getLista');

    // Clic en Guardar asistencia
    cy.contains('button', 'Guardar asistencia').click({ force: true });

    // Verificar que el backend procesa la petición de guardado
    cy.wait('@guardarAsistencia').its('response.statusCode').should('be.oneOf', [200, 201]);

    // Verificar que la tabla permanezca renderizada tras la actualización
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

});