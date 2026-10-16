describe('Pruebas de Caja Negra - Generar Excusa (UI)', () => {

    beforeEach(() => {
        // 1. Interceptamos la llamada al backend que trae los estudiantes del acudiente (id_usuario: 5).
        cy.intercept('GET', '**/api/acudientes_estudiantes/mis-estudiantes/5', {
            statusCode: 200,
            body: [
                { id_estudiante: 10, primer_nombre: 'Carlos', primer_apellido: 'Pérez' },
                { id_estudiante: 11, primer_nombre: 'Ana', primer_apellido: 'Gómez' }
            ]
        }).as('getEstudiantes');

        // 2. Inyectamos la sesión en el localStorage ANTES de cargar la URL
        // Esto evita que <RutaProtegida> expulse a Cypress al Login
        cy.visit('http://localhost:3000/generar-excusa', {
            onBeforeLoad: (win) => {
                win.localStorage.setItem('usuario', JSON.stringify({
                    id_usuario: 5,
                    id_cargo: 4, // 4 = Acudiente, vital para que App.js permita el acceso
                    nombre: "Acudiente Cypress",
                    token: "fake-jwt-token"
                }));
            }
        });

        // 3. Esperamos a que la petición simulada se complete
        cy.wait('@getEstudiantes');
    });

    // ============================================
    // CASOS BÁSICOS
    // ============================================
    it('CP-UI-01: Debe cargar la página de Generar Excusa y no expulsar al usuario', () => {
        cy.url().should('include', '/generar-excusa');
        cy.contains('GENERAR EXCUSA').should('be.visible');
    });

    it('CP-UI-02: Debe cargar los estudiantes asociados en el selector', () => {
        cy.get('select').eq(0).should('be.visible'); // El primer select es el de Estudiantes
        cy.contains('option', 'Carlos Pérez').should('exist');
        cy.contains('option', 'Ana Gómez').should('exist');
    });

    // ============================================
    // VALIDACIÓN DE CAMPOS VACÍOS
    // ============================================
    it('CP-UI-03: NO debe permitir radicar la excusa con campos vacíos', () => {
        cy.contains('button', 'Radicar Excusa').click();

        // Verificamos que el navegador bloquee el envío por los atributos 'required'
        cy.get('input[type="date"]:invalid').should('exist');
        cy.get('textarea:invalid').should('exist');
    });

    // ============================================
    // CASO DE ÉXITO (RADICAR EXCUSA)
    // ============================================
    it('CP-UI-04: Debe radicar una excusa correctamente y mostrar mensaje de éxito', () => {
        // Simulamos respuesta exitosa del backend al hacer POST
        cy.intercept('POST', '**/api/asistencias/excusa', {
            statusCode: 201,
            body: { mensaje: 'Excusa radicada con éxito.' }
        }).as('radicarExcusa');

        // Llenamos el formulario
        cy.get('select').eq(0).select('11'); // Selecciona a Ana Gómez
        cy.get('select').eq(1).select('Incapacidad Médica'); // Motivo
        cy.get('input[type="date"]').type('2026-10-15');
        cy.get('textarea').type('El estudiante presenta un cuadro febril.');

        // Enviamos
        cy.contains('button', 'Radicar Excusa').click();
        cy.wait('@radicarExcusa');

        // Validamos la UI
        cy.contains('.alert-success', 'Excusa radicada con éxito.').should('be.visible');
        cy.get('textarea').should('have.value', '');
    });

    // ============================================
    // CASO DE ERROR DE SERVIDOR
    // ============================================
    it('CP-UI-05: Debe mostrar alerta roja si el backend falla', () => {
        // Simulamos un fallo 500 en el backend
        cy.intercept('POST', '**/api/asistencias/excusa', {
            statusCode: 500,
            body: { error: 'Error interno de la base de datos al radicar.' }
        }).as('radicarExcusaError');

        cy.get('select').eq(1).select('Calamidad Doméstica');
        cy.get('input[type="date"]').type('2026-10-16');
        cy.get('textarea').type('Asunto personal de fuerza mayor.');

        cy.contains('button', 'Radicar Excusa').click();
        cy.wait('@radicarExcusaError');

        // Verificamos la alerta de error
        cy.contains('.alert-danger', 'Error interno de la base de datos').should('be.visible');
    });

});