// ==========================================
// PRUEBAS DE CAJA NEGRA - LOGIN (RF-02)
// Componente: Login.jsx
// ==========================================

describe("Login - Pruebas de caja negra", () => {

    const RUTA_LOGIN = "/"; // cambia si tu ruta de login es "/"
    const API_LOGIN = "**/api/usuarios/login";

    const correo = () => cy.get('input[type="email"]');
    const password = () => cy.get('input[type="password"]');
    const boton = () => cy.contains("button", /iniciar sesión|cargando/i);

    beforeEach(() => {
        cy.visit(RUTA_LOGIN);
    });

    // ==========================================
    // INTERFAZ
    // ==========================================

    it("CP-UI-01 - Muestra el título y el subtítulo", () => {
        cy.contains("Liceo Antonio De Toledo").should("be.visible");
        cy.contains("INICIO DE SESIÓN").should("be.visible");
    });

    it("CP-UI-02 - Muestra los campos correo y contraseña", () => {
        correo().should("be.visible").and("have.attr", "placeholder", "ejemplo@gmail.com");
        password().should("be.visible").and("have.attr", "type", "password");
    });

    it("CP-UI-03 - Muestra el botón Iniciar Sesión habilitado", () => {
        boton().should("be.visible").and("not.be.disabled");
    });

    it("CP-UI-04 - Muestra los enlaces de recuperar contraseña y registro", () => {
        cy.contains("a", "¿Olvidaste tu contraseña?").should("have.attr", "href", "/enviar_pin");
        cy.contains("a", "Registrarse").should("have.attr", "href", "/registro");
    });

    it("CP-UI-05 - No muestra ningún error al cargar la pantalla", () => {
        cy.get(".alert-danger").should("not.exist");
    });

    // ==========================================
    // VALIDACIONES DE CAMPOS
    // ==========================================

    it("CP-UI-06 - No envía el formulario con los campos vacíos", () => {
        cy.intercept("POST", API_LOGIN).as("login");

        boton().click();

        cy.get("@login.all").should("have.length", 0);
    });

    it("CP-UI-07 - No permite un correo con formato inválido", () => {
        cy.intercept("POST", API_LOGIN).as("login");

        correo().type("correo-sin-arroba");
        password().type("Clave12345");
        boton().click();

        cy.get("@login.all").should("have.length", 0);
    });

    it("CP-UI-08 - No permite contraseña de 7 caracteres (límite inferior - 1)", () => {
        cy.intercept("POST", API_LOGIN).as("login");

        correo().type("docente@correo.com");
        password().type("1234567");
        boton().click();

        cy.get("@login.all").should("have.length", 0);
    });

    it("CP-UI-09 - Acepta contraseña de 8 caracteres (límite inferior)", () => {
        cy.intercept("POST", API_LOGIN, {
            statusCode: 200,
            body: { usuario: { id_cargo: 3, cargo: "Docente" } }
        }).as("login");

        correo().type("docente@correo.com");
        password().type("12345678");
        boton().click();

        cy.wait("@login");
    });

    it("CP-UI-10 - Acepta contraseña de 20 caracteres (límite superior)", () => {
        cy.intercept("POST", API_LOGIN, {
            statusCode: 200,
            body: { usuario: { id_cargo: 3, cargo: "Docente" } }
        }).as("login");

        correo().type("docente@correo.com");
        password().type("a".repeat(20));
        boton().click();

        cy.wait("@login");
    });

    it("CP-UI-11 - No deja escribir más de 20 caracteres en la contraseña", () => {
        password().type("a".repeat(25));

        password().invoke("val").should("have.length", 20);
    });

    // ==========================================
    // LOGIN EXITOSO Y REDIRECCIÓN POR ROL
    // ==========================================

    it("CP-UI-12 - Administrador (rol 1) es redirigido a /vista_admin", () => {
        cy.intercept("POST", API_LOGIN, {
            statusCode: 200,
            body: { usuario: { id_cargo: 1, cargo: "Administrador" } }
        }).as("login");

        correo().type("admin@correo.com");
        password().type("Clave12345");
        boton().click();

        cy.wait("@login");
        cy.url().should("include", "/vista_admin");
    });

    it("CP-UI-13 - Coordinador (rol 2) es redirigido a /coordinador", () => {
        cy.intercept("POST", API_LOGIN, {
            statusCode: 200,
            body: { usuario: { id_cargo: 2, cargo: "Coordinador" } }
        }).as("login");

        correo().type("coordinador@correo.com");
        password().type("Clave12345");
        boton().click();

        cy.wait("@login");
        cy.url().should("include", "/coordinador");
    });

    it("CP-UI-14 - Docente (rol 3) es redirigido a /inicio", () => {
        cy.intercept("POST", API_LOGIN, {
            statusCode: 200,
            body: { usuario: { id_cargo: 3, cargo: "Docente" } }
        }).as("login");

        correo().type("docente@correo.com");
        password().type("Clave12345");
        boton().click();

        cy.wait("@login");
        cy.url().should("include", "/inicio");
    });

    it("CP-UI-15 - Acudiente (rol 4) es redirigido a /acudiente", () => {
        cy.intercept("POST", API_LOGIN, {
            statusCode: 200,
            body: { usuario: { id_cargo: 4, cargo: "Acudiente" } }
        }).as("login");

        correo().type("acudiente@correo.com");
        password().type("Clave12345");
        boton().click();

        cy.wait("@login");
        cy.url().should("include", "/acudiente");
    });

    it("CP-UI-16 - Envía el correo sin espacios al inicio y al final", () => {
        cy.intercept("POST", API_LOGIN, {
            statusCode: 200,
            body: { usuario: { id_cargo: 3, cargo: "Docente" } }
        }).as("login");

        correo().type("  docente@correo.com  ");
        password().type("Clave12345");
        boton().click();

        cy.wait("@login").its("request.body").should("deep.equal", {
            correo: "docente@correo.com",
            password: "Clave12345"
        });
    });

    // ==========================================
    // ERRORES
    // ==========================================

    it("CP-UI-17 - Credenciales incorrectas muestra el mensaje del servidor", () => {
        cy.intercept("POST", API_LOGIN, {
            statusCode: 401,
            body: { error: "Correo o contraseña incorrectos." }
        }).as("login");

        correo().type("noexiste@correo.com");
        password().type("Clave12345");
        boton().click();

        cy.wait("@login");
        cy.get(".alert-danger")
            .should("be.visible")
            .and("contain", "Correo o contraseña incorrectos.");
        cy.url().should("include", RUTA_LOGIN);
    });

    it("CP-UI-18 - Servidor caído muestra mensaje de conexión", () => {
        cy.intercept("POST", API_LOGIN, { forceNetworkError: true }).as("login");

        correo().type("docente@correo.com");
        password().type("Clave12345");
        boton().click();

        cy.get(".alert-danger")
            .should("be.visible")
            .and("contain", "No se pudo conectar con el servidor.");
    });

    it("CP-UI-19 - Respuesta sin datos de usuario muestra error", () => {
        cy.intercept("POST", API_LOGIN, {
            statusCode: 200,
            body: {}
        }).as("login");

        correo().type("docente@correo.com");
        password().type("Clave12345");
        boton().click();

        cy.get(".alert-danger")
            .should("be.visible")
            .and("contain", "El servidor no devolvió los datos del usuario.");
    });

    it("CP-UI-20 - Rol no configurado muestra error y no redirige", () => {
        cy.intercept("POST", API_LOGIN, {
            statusCode: 200,
            body: { usuario: { id_cargo: 5, cargo: "Desconocido" } }
        }).as("login");

        correo().type("usuario@correo.com");
        password().type("Clave12345");
        boton().click();

        cy.get(".alert-danger")
            .should("be.visible")
            .and("contain", "El rol asignado no cuenta con una vista configurada.");
        cy.url().should("include", RUTA_LOGIN);
    });

    // ==========================================
    // ESTADO DE CARGA
    // ==========================================

    it("CP-UI-21 - El botón se deshabilita y dice 'Cargando...' mientras responde el servidor", () => {
        cy.intercept("POST", API_LOGIN, {
            delay: 1500,
            statusCode: 200,
            body: { usuario: { id_cargo: 3, cargo: "Docente" } }
        }).as("login");

        correo().type("docente@correo.com");
        password().type("Clave12345");
        boton().click();

        cy.contains("button", "Cargando...").should("be.disabled");
        cy.wait("@login");
    });

    // ==========================================
    // NAVEGACIÓN
    // ==========================================

    it("CP-UI-22 - El enlace '¿Olvidaste tu contraseña?' lleva a /enviar_pin", () => {
        cy.contains("a", "¿Olvidaste tu contraseña?").click();

        cy.url().should("include", "/enviar_pin");
    });

    it("CP-UI-23 - El botón 'Registrarse' lleva a /registro", () => {
        cy.contains("a", "Registrarse").click();

        cy.url().should("include", "/registro");
    });
});