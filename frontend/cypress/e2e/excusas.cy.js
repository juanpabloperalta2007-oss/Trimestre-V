describe('Pruebas de Caja Negra - Gestión de Excusas (UI)', () => {

    beforeEach(() => {
        // 1. Evitamos que cualquier error interno de React rompa Cypress
        cy.on('uncaught:exception', () => false);

        // 2. Interceptamos TODAS las peticiones GET a tu API para asegurar que la tabla reciba datos simulados
        cy.intercept('GET', 'http://localhost:5000/api/**', {
            statusCode: 200,
            body: [
                {
                    id: 1,
                    estudiante: 'Carlos Pérez',
                    fecha: '2026-10-15',
                    motivo: 'Incapacidad Médica',
                    estado: 'Pendiente'
                }
            ]
        }).as('datosBackend');

        // 3. Inyectamos la sesión y visitamos la ruta
        cy.visit('http://localhost:3000/excusas', {
            onBeforeLoad: (win) => {
                win.localStorage.setItem('usuario', JSON.stringify({
                    id_usuario: 5,
                    id_cargo: 4, // Cargo 4 = Acudiente, necesario para <RutaProtegida>
                    nombre: "Acudiente Cypress"
                }));
            }
        });
    });

    // ============================================
    // COMPROBACIÓN DE VISTA BASE
    // ============================================
    it('CP-UI-01: Debe cargar la ruta sin expulsar al usuario al Login', () => {
        // Si este pasa, la inyección de sesión y RutaProtegida funcionan bien
        cy.url().should('include', '/excusas');
    });

    it('CP-UI-02: Debe mostrar el banner de advertencia (Alerta Amarilla)', () => {
        // Buscamos directamente la clase y el texto que está en Excusas.jsx
        cy.get('.alert-warning').should('be.visible');
        cy.contains('Revise y gestione las excusas de inasistencia presentadas por los estudiantes.').should('be.visible');
    });

    // ============================================
    // INTEGRACIÓN CON LA TABLA (ExcusasTable.jsx)
    // ============================================
    it('CP-UI-03: Debe cargar el componente de la tabla (ExcusasTable)', () => {
        // Buscamos el título de la tarjeta y los encabezados que están dentro de ExcusasTable.jsx
        cy.contains('Excusas Registradas').should('be.visible');
        cy.get('table').should('be.visible');
        cy.get('thead th').should('contain', 'Estudiante')
            .and('contain', 'Estado')
            .and('contain', 'Acciones');
    });

    it('CP-UI-04: La tabla debe renderizar los datos y los botones de acción', () => {
        // Comprobamos que el usuario simulado se dibuje en la fila
        cy.contains('Carlos Pérez').should('be.visible');
        cy.contains('Incapacidad Médica').should('be.visible');

        // Comprobamos que el badge de estado exista
        cy.contains('.badge.bg-warning', 'Pendiente').should('be.visible');

        // Comprobamos que existan los botones para el estado Pendiente
        cy.contains('button', 'Aprobar').should('not.be.disabled');
        cy.contains('button', 'Rechazar').should('not.be.disabled');
    });

});