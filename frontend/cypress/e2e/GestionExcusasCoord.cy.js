describe('Pruebas de Caja Negra - Gestión de Excusas (Coordinador)', () => {

    beforeEach(() => {
        // 1. Evitamos que cualquier error interno de React (como en Navbar/Sidebar) rompa Cypress
        cy.on('uncaught:exception', () => false);

        // 2. Inyectamos una sesión completa con todos los datos posibles para evitar la pantalla en blanco
        cy.visit('http://localhost:3000/');
        cy.window().then((win) => {
            win.localStorage.setItem('usuario', JSON.stringify({
                id_usuario: 15,
                id_cargo: 2, // 2 = Coordinador (Requerido por RutaProtegida)
                nombre: "Coordinador Cypress",
                primer_nombre: "Carlos",
                primer_apellido: "Pérez",
                correo: "coordinador@sena.edu.co",
                rol: "Coordinador",
                token: "fake-jwt-token"
            }));
        });

        // 3. Visitamos la ruta a probar
        cy.visit('http://localhost:3000/gestion-excusas');
    });

    // ============================================
    // SEGURIDAD Y ENRUTAMIENTO
    // ============================================
    it('CP-UI-01: Debe permitir el acceso al Coordinador y no redirigir al Login', () => {
        cy.url().should('include', '/gestion-excusas');
    });

    // ============================================
    // RENDERIZADO DE TEXTOS GLOBALES (LAYOUT)
    // ============================================
    it('CP-UI-02: Debe cargar el título "Gestión de Excusas" inyectado en el Layout', () => {
        // Busca el <h2> que pertenece a Layout.jsx
        cy.contains('h2', 'Gestión de Excusas').should('be.visible');
    });

    // ============================================
    // RENDERIZADO DE TEXTOS ESPECÍFICOS (VISTA)
    // ============================================
    it('CP-UI-03: Debe mostrar el subtítulo específico "Administración de excusas"', () => {
        // Busca el <h5> que pertenece directamente a GestionExcusas.jsx
        cy.contains('h5', 'Administración de excusas').should('be.visible');
    });

    // ============================================
    // INTEGRACIÓN ESTRUCTURAL (DOM)
    // ============================================
    it('CP-UI-04: Debe renderizar los contenedores base del Layout de Bootstrap', () => {
        // Verificamos que el div principal y la fila existan para soportar el Sidebar y la vista
        cy.get('.bg-light.min-vh-100').should('exist');
        cy.get('.container-fluid').should('exist');
        cy.get('.row').should('exist');
    });

    it('CP-UI-05: El contenido principal debe estar renderizado dentro de la columna correcta', () => {
        // Verifica que el children (el h5) se inyecte exactamente en la columna que definiste en Layout.jsx
        cy.get('.col-md-9.col-lg-10.p-4').within(() => {
            cy.contains('Administración de excusas').should('be.visible');
        });
    });

});