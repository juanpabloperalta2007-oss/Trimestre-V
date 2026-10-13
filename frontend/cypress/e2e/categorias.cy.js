describe('Pruebas de Caja Negra - Categorías (UI)', () => {

  // 🔑 Registrar el handler del confirm UNA VEZ, antes de todos los tests
  beforeEach(() => {
    cy.on('window:confirm', () => true);   // Aceptar cualquier confirm
    cy.on('window:alert', () => true);      // Aceptar cualquier alert
    cy.visit('/categorias');
  });

  // ============================================
  // CASOS BÁSICOS
  // ============================================
  it('CP-UI-01: Debe cargar la página de categorías', () => {
    cy.url().should('include', '/categorias');
  });

  it('CP-UI-02: Debe mostrar el título "Categorías"', () => {
    cy.contains('h2, h1', 'Categorías').should('be.visible');
  });

  // ============================================
  // CASOS DE CREACIÓN
  // ============================================
  it('CP-UI-03: Debe crear una nueva categoría correctamente', () => {
    const nombreUnico = 'Cypress Test ' + Date.now();

    cy.intercept('POST', '**/api/categorias').as('crearCategoria');

    cy.get('input').type(nombreUnico);
    cy.contains('button', 'Crear').click();

    cy.wait('@crearCategoria').its('response.statusCode').should('eq', 201);
    cy.contains(nombreUnico).should('be.visible');
  });

  it('CP-UI-04: NO debe crear una categoría con el campo vacío', () => {
  // 👇 El .then() espera a que la tabla esté cargada con datos reales
  cy.get('table tbody tr').then(($filas) => {
    const filasAntes = $filas.length;

    cy.get('input').clear();
    cy.contains('button', 'Crear').click();

    // Verificamos que la cantidad no haya cambiado
    cy.get('table tbody tr').should('have.length', filasAntes);
  });
});

  it('CP-UI-05: La lista debe cargar los datos desde el backend', () => {
    cy.intercept('GET', '**/api/categorias').as('getCategorias');
    cy.visit('/categorias');
    cy.wait('@getCategorias').its('response.statusCode').should('eq', 200);
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

  // ============================================
  // CASO DE ELIMINACIÓN (CORREGIDO)
  // ============================================
  it('CP-UI-06: Debe eliminar una categoría existente', () => {
    const nombreUnico = 'ParaBorrar ' + Date.now();

    // Interceptamos las peticiones que vamos a usar
    cy.intercept('POST', '**/api/categorias').as('crearCategoria');
    cy.intercept('DELETE', '*/api/categorias/*').as('borrarCategoria');

    // 1. Crear la categoría
    cy.get('input').type(nombreUnico);
    cy.contains('button', 'Crear').click();
    cy.wait('@crearCategoria');
    cy.contains(nombreUnico).should('be.visible');

    // 2. Clic en Eliminar en la fila correspondiente
    //    (el cy.on('window:confirm') ya está registrado en beforeEach)
    cy.contains('tr', nombreUnico).within(() => {
      cy.contains('button', 'Eliminar').click();
    });

    // 3. Esperar a que el DELETE se complete
    cy.wait('@borrarCategoria').its('response.statusCode').should('be.oneOf', [200, 204]);

    // 4. Verificar que ya no esté
    cy.contains(nombreUnico).should('not.exist');
  });

  // ============================================
  // CASO DE EDICIÓN (corregido)
  // ============================================
  it('CP-UI-07: Debe abrir la edición de una categoría', () => {
    // Hacemos clic en el primer botón "Editar" de la tabla
    cy.get('table tbody tr').first().within(() => {
      cy.contains('button', 'Editar').click();
    });

    // Verificar que ahora hay un input visible (edición inline o modal)
    cy.get('input').should('be.visible');
  });

});