// ==========================================
// PRUEBAS DE CAJA NEGRA - REGISTRO (RF-01)
// Componente: Registro.jsx
// ==========================================

describe("Registro - Pruebas de caja negra", () => {

    const RUTA_REGISTRO = "/registro";
    const API_REGISTRO = "**/api/usuarios/registro-publico";

    const DATOS_VALIDOS = {
        numero_documento: "1012345678",
        primer_nombre: "Andrés",
        primer_apellido: "Pérez",
        correo: "usuario@correo.com",
        password: "Clave12345"
    };

    const boton = () => cy.contains("button", /registrarse|registrando/i);

    const escribir = (selector, valor) => {
        if (valor !== "") {
            cy.get(selector).type(valor);
        }
    };

    // Llena el formulario con datos válidos, sobrescribiendo lo que se pase
    const llenarFormulario = (cambios = {}) => {
        const d = { ...DATOS_VALIDOS, ...cambios };
        escribir("#numero_documento", d.numero_documento);
        escribir("#primer_nombre", d.primer_nombre);
        escribir("#primer_apellido", d.primer_apellido);
        escribir("#correo", d.correo);
        escribir("#password", d.password);
    };

    const respuestaOk = { statusCode: 201, body: { mensaje: "Usuario registrado" } };

    beforeEach(() => {
        cy.visit(RUTA_REGISTRO);
    });

    // ==========================================
    // INTERFAZ
    // ==========================================

    it("CP-UI-01 - Muestra el título y el subtítulo", () => {
        cy.contains("h1", "Liceo Antonio De Toledo").should("be.visible");
        cy.contains("h2", "Registrar Usuario").should("be.visible");
    });

    it("CP-UI-02 - Muestra todos los campos del formulario", () => {
        cy.get("#tipo_documento").should("be.visible");
        cy.get("#numero_documento").should("be.visible");
        cy.get("#primer_nombre").should("be.visible");
        cy.get("#primer_apellido").should("be.visible");
        cy.get("#correo").should("be.visible");
        cy.get("#id_cargo").should("be.visible");
        cy.get("#password").should("be.visible").and("have.attr", "type", "password");
    });

    it("CP-UI-03 - Tipo de documento tiene CC por defecto y 4 opciones", () => {
        cy.get("#tipo_documento").should("have.value", "CC");
        cy.get("#tipo_documento option").should("have.length", 4);
        cy.get("#tipo_documento").select("TI").should("have.value", "TI");
    });

    it("CP-UI-04 - Rol tiene Acudiente por defecto y solo permite Acudiente o Docente", () => {
        cy.get("#id_cargo").should("have.value", "4");
        cy.get("#id_cargo option").should("have.length", 2);
        cy.get("#id_cargo").select("Docente").should("have.value", "3");
    });

    it("CP-UI-05 - Muestra el botón Registrarse habilitado y sin mensajes de error", () => {
        boton().should("be.visible").and("not.be.disabled");
        cy.get(".alert-danger").should("not.exist");
        cy.get(".alert-success").should("not.exist");
    });

    // ==========================================
    // FILTRADO DE CARACTERES EN TIEMPO REAL
    // ==========================================

    it("CP-UI-06 - Número de documento ignora letras y símbolos", () => {
        cy.get("#numero_documento").type("12ab-34.56");

        cy.get("#numero_documento").should("have.value", "123456");
    });

    it("CP-UI-07 - Primer nombre ignora números y caracteres especiales", () => {
        cy.get("#primer_nombre").type("Juan123@#");

        cy.get("#primer_nombre").should("have.value", "Juan");
    });

    it("CP-UI-08 - Primer apellido ignora números y caracteres especiales", () => {
        cy.get("#primer_apellido").type("Pérez456!");

        cy.get("#primer_apellido").should("have.value", "Pérez");
    });

    it("CP-UI-09 - Nombre y apellido aceptan tildes y la letra ñ", () => {
        cy.get("#primer_nombre").type("Íñigo");
        cy.get("#primer_apellido").type("Muñoz");

        cy.get("#primer_nombre").should("have.value", "Íñigo");
        cy.get("#primer_apellido").should("have.value", "Muñoz");
    });

    // ==========================================
    // VALIDACIÓN DE CAMPOS OBLIGATORIOS
    // ==========================================

    it("CP-UI-10 - No envía el formulario con todos los campos vacíos", () => {
        cy.intercept("POST", API_REGISTRO, respuestaOk).as("registro");

        boton().click();

        cy.get("@registro.all").should("have.length", 0);
    });

    it("CP-UI-11 - Nombre con solo espacios muestra 'Todos los campos son obligatorios.'", () => {
        cy.intercept("POST", API_REGISTRO, respuestaOk).as("registro");

        llenarFormulario({ primer_nombre: "   " });
        boton().click();

        cy.get(".alert-danger")
            .should("be.visible")
            .and("contain", "Todos los campos son obligatorios.");
        cy.get("@registro.all").should("have.length", 0);
    });

    // ==========================================
    // VALIDACIÓN DEL DOCUMENTO (valores límite 6 - 15)
    // ==========================================

    it("CP-UI-12 - Documento de 5 dígitos es rechazado (límite inferior - 1)", () => {
        cy.intercept("POST", API_REGISTRO, respuestaOk).as("registro");

        llenarFormulario({ numero_documento: "12345" });
        boton().click();

        cy.get(".alert-danger")
            .should("be.visible")
            .and("contain", "El número de documento debe tener entre 6 y 15 dígitos.");
        cy.get("@registro.all").should("have.length", 0);
    });

    it("CP-UI-13 - Documento de 6 dígitos es aceptado (límite inferior)", () => {
        cy.intercept("POST", API_REGISTRO, respuestaOk).as("registro");

        llenarFormulario({ numero_documento: "123456" });
        boton().click();

        cy.wait("@registro");
    });

    it("CP-UI-14 - Documento de 15 dígitos es aceptado (límite superior)", () => {
        cy.intercept("POST", API_REGISTRO, respuestaOk).as("registro");

        llenarFormulario({ numero_documento: "123456789012345" });
        boton().click();

        cy.wait("@registro");
    });

    it("CP-UI-15 - Documento de 16 dígitos es rechazado (límite superior + 1)", () => {
        cy.intercept("POST", API_REGISTRO, respuestaOk).as("registro");

        llenarFormulario({ numero_documento: "1234567890123456" });
        boton().click();

        cy.get(".alert-danger")
            .should("be.visible")
            .and("contain", "El número de documento debe tener entre 6 y 15 dígitos.");
        cy.get("@registro.all").should("have.length", 0);
    });

    // ==========================================
    // VALIDACIÓN DE CORREO
    // ==========================================

    it("CP-UI-16 - Correo sin @ no envía el formulario", () => {
        cy.intercept("POST", API_REGISTRO, respuestaOk).as("registro");

        llenarFormulario({ correo: "correo-sin-arroba" });
        boton().click();

        cy.get("@registro.all").should("have.length", 0);
    });

    it("CP-UI-17 - Correo sin punto en el dominio (a@b) muestra error de correo inválido", () => {
        cy.intercept("POST", API_REGISTRO, respuestaOk).as("registro");

        llenarFormulario({ correo: "usuario@dominio" });
        boton().click();

        cy.get(".alert-danger")
            .should("be.visible")
            .and("contain", "Ingrese un correo electrónico válido.");
        cy.get("@registro.all").should("have.length", 0);
    });

    // ==========================================
    // VALIDACIÓN DE CONTRASEÑA
    // ==========================================

    const MENSAJE_PASSWORD =
        "La contraseña debe tener entre 8 y 20 caracteres, contener letras y números, y no incluir espacios ni caracteres especiales.";

    it("CP-UI-18 - Contraseña de 7 caracteres es rechazada (límite inferior - 1)", () => {
        cy.intercept("POST", API_REGISTRO, respuestaOk).as("registro");

        llenarFormulario({ password: "Abc1234" });
        boton().click();

        cy.get(".alert-danger").should("be.visible").and("contain", MENSAJE_PASSWORD);
        cy.get("@registro.all").should("have.length", 0);
    });

    it("CP-UI-19 - Contraseña de 8 caracteres es aceptada (límite inferior)", () => {
        cy.intercept("POST", API_REGISTRO, respuestaOk).as("registro");

        llenarFormulario({ password: "Abcd1234" });
        boton().click();

        cy.wait("@registro");
    });

    it("CP-UI-20 - Contraseña de 20 caracteres es aceptada (límite superior)", () => {
        cy.intercept("POST", API_REGISTRO, respuestaOk).as("registro");

        llenarFormulario({ password: "Abcdefghi1234567890A".slice(0, 20) });
        boton().click();

        cy.wait("@registro");
    });

    it("CP-UI-21 - Contraseña de 21 caracteres es rechazada (límite superior + 1)", () => {
        cy.intercept("POST", API_REGISTRO, respuestaOk).as("registro");

        llenarFormulario({ password: "Abcdefghi12345678901A" });
        boton().click();

        cy.get(".alert-danger").should("be.visible").and("contain", MENSAJE_PASSWORD);
        cy.get("@registro.all").should("have.length", 0);
    });

    it("CP-UI-22 - Contraseña solo con letras es rechazada", () => {
        cy.intercept("POST", API_REGISTRO, respuestaOk).as("registro");

        llenarFormulario({ password: "abcdefghij" });
        boton().click();

        cy.get(".alert-danger").should("be.visible").and("contain", MENSAJE_PASSWORD);
        cy.get("@registro.all").should("have.length", 0);
    });

    it("CP-UI-23 - Contraseña solo con números es rechazada", () => {
        cy.intercept("POST", API_REGISTRO, respuestaOk).as("registro");

        llenarFormulario({ password: "1234567890" });
        boton().click();

        cy.get(".alert-danger").should("be.visible").and("contain", MENSAJE_PASSWORD);
        cy.get("@registro.all").should("have.length", 0);
    });

    it("CP-UI-24 - Contraseña con caracteres especiales es rechazada", () => {
        cy.intercept("POST", API_REGISTRO, respuestaOk).as("registro");

        llenarFormulario({ password: "Clave123!" });
        boton().click();

        cy.get(".alert-danger").should("be.visible").and("contain", MENSAJE_PASSWORD);
        cy.get("@registro.all").should("have.length", 0);
    });

    it("CP-UI-25 - Contraseña con espacios es rechazada", () => {
        cy.intercept("POST", API_REGISTRO, respuestaOk).as("registro");

        llenarFormulario({ password: "Clave 12345" });
        boton().click();

        cy.get(".alert-danger").should("be.visible").and("contain", MENSAJE_PASSWORD);
        cy.get("@registro.all").should("have.length", 0);
    });

    // ==========================================
    // REGISTRO EXITOSO
    // ==========================================

    it("CP-UI-26 - Registro exitoso muestra mensaje y redirige al login", () => {
        cy.intercept("POST", API_REGISTRO, respuestaOk).as("registro");

        llenarFormulario();
        boton().click();

        cy.wait("@registro");
        cy.get(".alert-success")
            .should("be.visible")
            .and("contain", "¡Registro exitoso!");
        cy.location("pathname", { timeout: 5000 }).should("eq", "/");
    });

    it("CP-UI-27 - Envía los datos correctos por defecto (CC y rol Acudiente)", () => {
        cy.intercept("POST", API_REGISTRO, respuestaOk).as("registro");

        llenarFormulario();
        boton().click();

        cy.wait("@registro").its("request.body").should("deep.equal", {
            tipo_documento: "CC",
            numero_documento: "1012345678",
            primer_nombre: "Andrés",
            primer_apellido: "Pérez",
            correo: "usuario@correo.com",
            password: "Clave12345",
            id_cargo: "4"
        });
    });

    it("CP-UI-28 - Registro como Docente envía id_cargo 3", () => {
        cy.intercept("POST", API_REGISTRO, respuestaOk).as("registro");

        llenarFormulario();
        cy.get("#id_cargo").select("Docente");
        boton().click();

        cy.wait("@registro").its("request.body.id_cargo").should("eq", "3");
    });

    it("CP-UI-29 - Envía nombre, apellido y correo sin espacios al inicio y al final", () => {
        cy.intercept("POST", API_REGISTRO, respuestaOk).as("registro");

        llenarFormulario({
            primer_nombre: "  Andrés  ",
            primer_apellido: "  Pérez  ",
            correo: "  usuario@correo.com  "
        });
        boton().click();

        cy.wait("@registro").its("request.body").then((body) => {
            expect(body.primer_nombre).to.eq("Andrés");
            expect(body.primer_apellido).to.eq("Pérez");
            expect(body.correo).to.eq("usuario@correo.com");
        });
    });

    // ==========================================
    // ERRORES DEL SERVIDOR
    // ==========================================

    it("CP-UI-30 - Usuario ya registrado muestra el mensaje del servidor", () => {
        cy.intercept("POST", API_REGISTRO, {
            statusCode: 409,
            body: { error: "El correo ya se encuentra registrado." }
        }).as("registro");

        llenarFormulario();
        boton().click();

        cy.wait("@registro");
        cy.get(".alert-danger")
            .should("be.visible")
            .and("contain", "El correo ya se encuentra registrado.");
        cy.get(".alert-success").should("not.exist");
        cy.location("pathname").should("eq", RUTA_REGISTRO);
    });

    it("CP-UI-31 - Error del servidor sin mensaje muestra el mensaje genérico", () => {
        cy.intercept("POST", API_REGISTRO, {
            statusCode: 500,
            body: {}
        }).as("registro");

        llenarFormulario();
        boton().click();

        cy.wait("@registro");
        cy.get(".alert-danger")
            .should("be.visible")
            .and("contain", "Error al realizar el registro. Intente de nuevo.");
    });

    it("CP-UI-32 - Servidor caído muestra el mensaje genérico", () => {
        cy.intercept("POST", API_REGISTRO, { forceNetworkError: true }).as("registro");

        llenarFormulario();
        boton().click();

        cy.get(".alert-danger")
            .should("be.visible")
            .and("contain", "Error al realizar el registro. Intente de nuevo.");
    });

    // ==========================================
    // ESTADO DE CARGA
    // ==========================================

    it("CP-UI-33 - El botón se deshabilita y dice 'Registrando...' mientras responde el servidor", () => {
        cy.intercept("POST", API_REGISTRO, { ...respuestaOk, delay: 1500 }).as("registro");

        llenarFormulario();
        boton().click();

        cy.contains("button", "Registrando...").should("be.disabled");
        cy.wait("@registro");
    });

    it("CP-UI-34 - El mensaje de error anterior desaparece al reintentar", () => {
        cy.intercept("POST", API_REGISTRO, {
            statusCode: 409,
            body: { error: "El correo ya se encuentra registrado." }
        }).as("registro");

        llenarFormulario();
        boton().click();
        cy.get(".alert-danger").should("be.visible");

        cy.intercept("POST", API_REGISTRO, respuestaOk).as("registroOk");
        boton().click();

        cy.wait("@registroOk");
        cy.get(".alert-danger").should("not.exist");
        cy.get(".alert-success").should("be.visible");
    });
});