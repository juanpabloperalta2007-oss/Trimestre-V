describe('Pruebas de Caja Negra - Estadística Mensual (Acudiente)', () => {

    beforeEach(() => {
        // 1. Evitar que errores internos de React detengan la prueba
        cy.on('uncaught:exception', () => false);

        // 2. Interceptamos la llamada para obtener los estudiantes vinculados al acudiente (ID: 5)
        cy.intercept('GET', '**/api/acudientes_estudiantes/mis-estudiantes/5', {
            statusCode: 200,
            body: [
                { id_estudiante: 10, primer_nombre: 'Carlos', primer_apellido: 'Pérez' },
                { id_estudiante: 11, primer_nombre: 'Ana', primer_apellido: 'Gómez' }
            ]
        }).as('getEstudiantes');

        // 3. Interceptamos la llamada de las estadísticas (usamos comodín ** para ignorar el mes exacto en la carga inicial)
        cy.intercept('GET', '**/api/asistencia/estadisticas/**', {
            statusCode: 200,
            body: {
                asistencias: 18,
                fallas_sin_justificar: 2,
                fallas_justificadas: 1,
                retardos: 3
            }
        }).as('getEstadisticas');

        // 4. Inyectamos la sesión y visitamos la ruta definida en App.js
        cy.visit('http://localhost:3000/estadistica-mensual', {
            onBeforeLoad: (win) => {
                win.localStorage.setItem('usuario', JSON.stringify({
                    id_usuario: 5,
                    id_cargo: 4, // Cargo 4 = Acudiente
                    nombre: "Acudiente Cypress"
                }));
            }
        });
    });

    // ============================================
    // RENDERIZADO BÁSICO Y LAYOUT
    // ============================================
    it('CP-UI-01: Debe cargar la vista sin ser bloqueado por RutaProtegida', () => {
        cy.url().should('include', '/estadistica-mensual');
        cy.contains('ESTADÍSTICA MENSUAL DE ASISTENCIA').should('be.visible');
    });

    it('CP-UI-02: Debe mostrar la información del estudiante seleccionado por defecto', () => {
        cy.wait('@getEstudiantes');

        // Verificamos el texto principal
        cy.contains('Mostrando reporte para:').should('be.visible');

        // Buscamos las palabras independientemente para evadir el problema de los dobles espacios en React
        cy.get('strong.text-primary')
            .should('contain.text', 'Carlos')
            .and('contain.text', 'Pérez')
            .and('be.visible');
    });

    // ============================================
    // VALIDACIÓN DE LAS MÉTRICAS (TARJETAS)
    // ============================================
    it('CP-UI-03: Debe renderizar las 4 tarjetas con los datos correctos del backend', () => {
        cy.wait('@getEstudiantes');
        cy.wait('@getEstadisticas');

        // Verificamos que los títulos de las tarjetas existan
        cy.contains('Asistencias').should('be.visible');
        cy.contains('Fallas sin justificar').should('be.visible');
        cy.contains('Fallas justificadas').should('be.visible');
        cy.contains('Retardos').should('be.visible');

        // Verificamos que los números simulados en el interceptor se estén renderizando en los <h1>
        cy.contains('h1', '18').should('be.visible'); // Asistencias
        cy.contains('h1', '2').should('be.visible');  // Fallas sin justificar
        cy.contains('h1', '1').should('be.visible');  // Fallas justificadas
        cy.contains('h1', '3').should('be.visible');  // Retardos
    });

    // ============================================
    // INTERACCIÓN Y CAMBIO DE FILTROS
    // ============================================
    it('CP-UI-04: Debe actualizar las estadísticas al cambiar el mes', () => {
        cy.wait('@getEstudiantes');
        cy.wait('@getEstadisticas');

        // Preparamos una nueva respuesta simulada para el mes de Febrero (mes=2)
        cy.intercept('GET', '**/api/asistencia/estadisticas/10?mes=2', {
            statusCode: 200,
            body: {
                asistencias: 20,
                fallas_sin_justificar: 0,
                fallas_justificadas: 0,
                retardos: 1
            }
        }).as('getEstadisticasFebrero');

        // El componente renderiza 2 selects si hay más de 1 estudiante (el de estudiante y el de mes)
        // El select de mes está asociado al texto "Mes:"
        cy.contains('label', 'Mes:').next('select').select('2'); // Seleccionamos Febrero (id: 2)

        // Esperamos que se dispare la nueva petición
        cy.wait('@getEstadisticasFebrero');

        // Verificamos que los números en la UI se hayan actualizado
        cy.contains('h1', '20').should('be.visible'); // Nuevas asistencias
        cy.contains('h1', '0').should('be.visible');  // Nuevas fallas sin justificar
    });

    // ============================================
    // MANEJO DE ESTADOS VACÍOS
    // ============================================
    it('CP-UI-05: Debe mostrar mensaje de estado vacío si el acudiente no tiene estudiantes', () => {
        // Sobrescribimos el interceptor para simular un arreglo vacío
        cy.intercept('GET', '**/api/acudientes_estudiantes/mis-estudiantes/5', {
            statusCode: 200,
            body: []
        }).as('getSinEstudiantes');

        // Recargamos la vista para aplicar la nueva simulación
        cy.visit('http://localhost:3000/estadistica-mensual', {
            onBeforeLoad: (win) => {
                win.localStorage.setItem('usuario', JSON.stringify({
                    id_usuario: 5, id_cargo: 4
                }));
            }
        });

        cy.wait('@getSinEstudiantes');

        // Validamos que se muestre la tarjeta de estado vacío en lugar de las métricas
        cy.contains('No tienes estudiantes asociados para consultar.').should('be.visible');

        // Verificamos que las tarjetas numéricas no existan en el DOM
        cy.contains('Asistencias').should('not.exist');
    });

});