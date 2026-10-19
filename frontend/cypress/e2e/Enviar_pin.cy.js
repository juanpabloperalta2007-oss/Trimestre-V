// ==========================================
// PRUEBAS DE CAJA NEGRA - ENVIAR PIN / RECUPERAR CONTRASEÑA
// Componente: Enviar_pin.jsx
// ==========================================

describe("Enviar PIN - Pruebas de caja negra", () => {

    const RUTA_ENVIAR_PIN = "/enviar_pin";
    const API_RECUPERAR = "**/api/usuarios/recuperar-password";

    const correo = () => cy.get("#correo");
    const boton = () => cy.contains("button", /continuar|verificando/i);

    const respuestaOk = { statusCode: 200, body: { mensaje: "PIN enviado" } };

    beforeEach(() => {
        cy.visit(RUTA_ENVIAR_PIN);
    });

    // ==========================================
    // INTERFAZ
    // ==========================================

    it("CP-UI-01 - Muestra el título y el subtítulo", () => {
        cy.contains("h1", "Liceo Antonio De Toledo").should("be.visible");
        cy.contains("h2", "Recuperación de Contraseña").should("be.visible");
    });

    it("CP-UI-02 - Muestra el campo de correo con su etiqueta y placeholder", () => {
        cy.contains("label", "Ingrese su Correo electrónico").should("be.visible");
        correo()
            .should("be.visible")
            .and("have.attr", "type", "email")
            .and("have.attr", "placeholder", "ejemplo@gmail.com");
    });

    it("CP-UI-03 - Muestra el botón Continuar habilitado", () => {
        boton().should("be.visible").and("not.be.disabled");
    });

    it("CP-UI-04 - No muestra ningún mensaje al cargar la pantalla", () => {
        cy.get(".alert").should("not.exist");
    });

    it("CP-UI-05 - El campo de correo es obligatorio y empieza vacío", () => {
        correo().should("have.value", "").and("have.attr", "required");
    });

    // ==========================================
    // VALIDACIONES DEL CORREO
    // ==========================================

    it("CP-UI-06 - No envía el formulario con el correo vacío", () => {
        cy.intercept("POST", API_RECUPERAR, respuestaOk).as("recuperar");

        boton().click();

        cy.get("@recuperar.all").should("have.length", 0);
        cy.location("pathname").should("eq", RUTA_ENVIAR_PIN);
    });

    it("CP-UI-07 - No envía el formulario con un correo sin @", () => {
        cy.intercept("POST", API_RECUPERAR, respuestaOk).as("recuperar");

        correo().type("correo-sin-arroba");
        boton().click();

        cy.get("@recuperar.all").should("have.length", 0);
    });

    it("CP-UI-08 - No envía el formulario con un correo incompleto (usuario@)", () => {
        cy.intercept("POST", API_RECUPERAR, respuestaOk).as("recuperar");

        correo().type("usuario@");
        boton().click();

        cy.get("@recuperar.all").should("have.length", 0);
    });

    it("CP-UI-09 - Un correo con solo espacios se trata como vacío y no se envía", () => {
        cy.intercept("POST", API_RECUPERAR, respuestaOk).as("recuperar");

        correo().type("     ");
        boton().click();

        cy.get("@recuperar.all").should("have.length", 0);
    });

    // ==========================================
    // ENVÍO EXITOSO
    // ==========================================

    it("CP-UI-10 - Correo registrado muestra mensaje de éxito", () => {
        cy.intercept("POST", API_RECUPERAR, respuestaOk).as("recuperar");

        correo().type("docente@correo.com");
        boton().click();

        cy.wait("@recuperar");
        cy.get(".alert-success")
            .should("be.visible")
            .and("contain", "Verifique su correo. Redirigiendo para cambiar la contraseña...");
        cy.get(".alert-danger").should("not.exist");
    });

    it("CP-UI-11 - Tras el éxito redirige a /nueva_contrasena", () => {
        cy.intercept("POST", API_RECUPERAR, respuestaOk).as("recuperar");

        correo().type("docente@correo.com");
        boton().click();

        cy.wait("@recuperar");
        cy.location("pathname", { timeout: 5000 }).should("eq", "/nueva_contrasena");
    });

    it("CP-UI-12 - Envía el correo escrito con método POST y formato JSON", () => {
        cy.intercept("POST", API_RECUPERAR, respuestaOk).as("recuperar");

        correo().type("docente@correo.com");
        boton().click();

        cy.wait("@recuperar").then(({ request }) => {
            expect(request.method).to.eq("POST");
            expect(request.headers["content-type"]).to.include("application/json");
            expect(request.body).to.deep.equal({ correo: "docente@correo.com" });
        });
    });

    // ==========================================
    // ERRORES DEL SERVIDOR
    // ==========================================

    it("CP-UI-13 - Correo no registrado muestra el mensaje que envía el servidor", () => {
        cy.intercept("POST", API_RECUPERAR, {
            statusCode: 404,
            body: { error: "El correo no existe en el sistema." }
        }).as("recuperar");

        correo().type("noexiste@correo.com");
        boton().click();

        cy.wait("@recuperar");
        cy.get(".alert-danger")
            .should("be.visible")
            .and("contain", "El correo no existe en el sistema.");
        cy.get(".alert-success").should("not.exist");
        cy.location("pathname").should("eq", RUTA_ENVIAR_PIN);
    });

    it("CP-UI-14 - Error del servidor sin mensaje muestra el texto por defecto", () => {
        cy.intercept("POST", API_RECUPERAR, {
            statusCode: 404,
            body: {}
        }).as("recuperar");

        correo().type("noexiste@correo.com");
        boton().click();

        cy.wait("@recuperar");
        cy.get(".alert-danger")
            .should("be.visible")
            .and("contain", "El correo no está registrado en la plataforma.");
    });

    it("CP-UI-15 - Servidor caído muestra el mensaje de error de conexión", () => {
        cy.intercept("POST", API_RECUPERAR, { forceNetworkError: true }).as("recuperar");

        correo().type("docente@correo.com");
        boton().click();

        cy.get(".alert-danger")
            .should("be.visible")
            .and("contain", "Error al conectar con el servidor. Intente más tarde.");
        cy.location("pathname").should("eq", RUTA_ENVIAR_PIN);
    });

    it("CP-UI-16 - Respuesta del servidor que no es JSON muestra el mensaje de error de conexión", () => {
        cy.intercept("POST", API_RECUPERAR, {
            statusCode: 500,
            headers: { "content-type": "text/html" },
            body: "<h1>Internal Server Error</h1>"
        }).as("recuperar");

        correo().type("docente@correo.com");
        boton().click();

        cy.wait("@recuperar");
        cy.get(".alert-danger")
            .should("be.visible")
            .and("contain", "Error al conectar con el servidor. Intente más tarde.");
    });

    // ==========================================
    // ESTADO DE CARGA Y REINTENTOS
    // ==========================================

    it("CP-UI-17 - El botón se deshabilita y dice 'Verificando...' mientras responde el servidor", () => {
        cy.intercept("POST", API_RECUPERAR, { ...respuestaOk, delay: 1500 }).as("recuperar");

        correo().type("docente@correo.com");
        boton().click();

        cy.contains("button", "Verificando...").should("be.disabled");
        cy.wait("@recuperar");
    });

    it("CP-UI-18 - El botón se reactiva después de un error", () => {
        cy.intercept("POST", API_RECUPERAR, {
            statusCode: 404,
            body: { error: "El correo no existe en el sistema." }
        }).as("recuperar");

        correo().type("noexiste@correo.com");
        boton().click();

        cy.wait("@recuperar");
        cy.contains("button", "Continuar").should("not.be.disabled");
    });

    it("CP-UI-19 - El mensaje de error desaparece al reintentar y se muestra el de éxito", () => {
        cy.intercept("POST", API_RECUPERAR, {
            statusCode: 404,
            body: { error: "El correo no existe en el sistema." }
        }).as("recuperarError");

        correo().type("docente@correo.com");
        boton().click();
        cy.get(".alert-danger").should("be.visible");

        cy.intercept("POST", API_RECUPERAR, respuestaOk).as("recuperarOk");
        boton().click();

        cy.wait("@recuperarOk");
        cy.get(".alert-danger").should("not.exist");
        cy.get(".alert-success").should("be.visible");
    });
});