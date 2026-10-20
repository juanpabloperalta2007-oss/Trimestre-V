describe('Pruebas de Caja Negra - Llamar Lista (Docente)', () => {

    beforeEach(() => {
        // 1. Evitamos que errores de React rompan Cypress
        cy.on('uncaught:exception', () => false);

        // 2. Interceptamos el backend general simulando que sí está conectado
        cy.intercept('GET', '**/api/mensaje', { statusCode: 200, body: { mensaje: "Conexión simulada OK" } });

        // 3. Interceptamos la petición de la lista de asistencia
        cy.intercept('GET', '**/api/asistencia/**', [
            { id_estudiante: 1, primer_nombre: "Juan", primer_apellido: "Pérez", estado: "P", observaciones: "" },
            { id_estudiante: 2, primer_nombre: "Ana", primer_apellido: "Gómez", estado: "A", observaciones: "" }
        ]).as('obtenerLista');

        // 4. Interceptamos el guardado
        cy.intercept('POST', '**/api/asistencia', {
            statusCode: 200,
            body: { mensaje: "Asistencia guardada" }
        }).as('guardarLista');

        // 5. Inyectamos sesión DOCENTE
        cy.visit('http://localhost:3000/');
        cy.window().then((win) => {
            win.localStorage.setItem('usuario', JSON.stringify({
                id_usuario: 20,
                id_cargo: 3,
                nombre: "Docente Cypress",
                primer_nombre: "Carlos",
                primer_apellido: "Profesor",
                correo: "docente@sena.edu.co",
                rol: "Docente",
                token: "fake-jwt-token"
            }));
        });

        // 6. Visitamos la ruta EXACTA con mayúsculas
        cy.visit('http://localhost:3000/llamar-lista');
    });

    // ============================================
    // RENDERIZADO INICIAL
    // ============================================
    it('CP-UI-01: Debe cargar la vista y mostrar el formulario "Registrar asistencia"', () => {
        cy.url().should('include', '/llamar-lista');
        cy.contains('h2', 'Llamar lista').should('be.visible');
        cy.contains('h5', 'Registrar asistencia').should('be.visible');
    });

    // ============================================
    // VALIDACIÓN DEL FORMULARIO
    // ============================================
    it('CP-UI-02: Debe mostrar error si se intenta cargar la lista sin un código válido', () => {
        cy.contains('button', 'Cargar lista').click();
        cy.get('.alert-danger').should('be.visible').and('contain.text', 'Debe ingresar un código válido');
    });

    // ============================================
    // CARGA DE TABLA
    // ============================================
    it('CP-UI-03: Debe cargar y mostrar la tabla de estudiantes correctamente', () => {
        cy.get('input[type="number"]').type('5');
        cy.contains('button', 'Cargar lista').click();

        cy.get('table').should('be.visible');
        cy.contains('Juan Pérez').should('be.visible');
        cy.contains('Ana Gómez').should('be.visible');

        cy.contains('h2.text-primary', '2').should('be.visible');
        cy.contains('h2.text-success', '1').should('be.visible');
        cy.contains('h2.text-danger', '1').should('be.visible');
    });

    // ============================================
    // BOTONES DE ESTADO
    // ============================================
    it('CP-UI-04: Debe permitir cambiar el estado de un estudiante y actualizar contadores', () => {
        cy.get('input[type="number"]').type('5');
        cy.contains('button', 'Cargar lista').click();

        cy.contains('tr', 'Ana Gómez').within(() => {
            cy.contains('button', 'Tardía').click();
        });

        cy.contains('h2.text-danger', '0').should('be.visible');
        cy.contains('h2.text-warning', '1').should('be.visible');
    });

    it('CP-UI-05: El botón "Todos presentes" debe cambiar todos los estados', () => {
        cy.get('input[type="number"]').type('5');
        cy.contains('button', 'Cargar lista').click();

        cy.contains('button', 'Todos presentes').click();

        cy.contains('h2.text-success', '2').should('be.visible');
        cy.contains('h2.text-danger', '0').should('be.visible');
    });

    // ============================================
    // GUARDAR
    // ============================================
    it('CP-UI-06: Debe simular el guardado y mostrar el mensaje de éxito', () => {
        cy.get('input[type="number"]').type('5');
        cy.contains('button', 'Cargar lista').click();

        cy.contains('button', 'Guardar asistencia').click();

        cy.get('.alert-success').should('be.visible').and('contain.text', 'guardada correctamente');
    });

});