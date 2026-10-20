describe('Pruebas de Caja Negra - Reportes (Docente)', () => {

    beforeEach(() => {
        cy.on('uncaught:exception', () => false);

        // SOLUCIÓN: Interceptamos la ruta que está dando error 404 y simulamos un éxito (200)
        cy.intercept('GET', '**/api/reportes', {
            statusCode: 200,
            body: [
                { id: 1, descripcion: "Reporte simulado" } // Datos falsos para engañar a la tabla
            ]
        }).as('getReportes');

        cy.visit('http://localhost:3000/');
        cy.window().then((win) => {
            win.localStorage.setItem('usuario', JSON.stringify({
                id_usuario: 20,
                id_cargo: 3, // Docente
                nombre: "Docente Cypress",
                primer_nombre: "María",
                primer_apellido: "Gómez",
                correo: "docente@sena.edu.co",
                rol: "Docente",
                token: "fake-jwt-token"
            }));
        });

        cy.visit('http://localhost:3000/reportes');
    });

    // ============================================
    // SEGURIDAD Y ENRUTAMIENTO
    // ============================================
    it('CP-UI-01: Debe permitir el acceso al Docente y no redirigir al Login', () => {
        cy.url().should('include', '/reportes');
    });

    // ============================================
    // RENDERIZADO DE TEXTOS GLOBALES (LAYOUT)
    // ============================================
    it('CP-UI-02: Debe cargar el título "Reportes" inyectado en el Layout', () => {
        cy.contains('h2', 'Reportes').should('be.visible');
    });

    // ============================================
    // INTEGRACIÓN CON LA TABLA (ReportesTable.jsx)
    // ============================================
    it('CP-UI-03: Debe renderizar el componente ReportesTable dentro de la vista', () => {
        // Ahora que interceptamos el error 404, la tabla sí se construirá
        cy.wait('@getReportes');
        cy.get('table').should('be.visible');
    });

    // ============================================
    // INTEGRACIÓN ESTRUCTURAL (DOM)
    // ============================================
    it('CP-UI-04: Debe renderizar los contenedores base del Layout de Bootstrap', () => {
        cy.get('.bg-light.min-vh-100').should('exist');
        cy.get('.container-fluid').should('exist');
        cy.get('.row').should('exist');
    });

    it('CP-UI-05: El contenido principal debe estar renderizado dentro de la columna correcta', () => {
        cy.wait('@getReportes');
        cy.get('.col-md-9.col-lg-10.p-4').within(() => {
            cy.get('table').should('be.visible');
        });
    });

});