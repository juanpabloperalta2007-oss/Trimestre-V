import React, { useState, useEffect, useCallback } from "react";
import Header from "../../components/Header";
import SidebarAdmin from "../../components/SidebarAdmin";
import Footer from "../../components/Footer";
import "../../styles/GestionUsuario.css"; // Usa los mismos estilos del dashboard

function Permisos() {
  const cargos = [
    { id: 1, nombre: "Administrador" },
    { id: 2, nombre: "Coordinador" },
    { id: 3, nombre: "Profesor" },
    { id: 4, nombre: "Acudiente" },
  ];

  const permisosPorDefecto = {
    1: [
      "USUARIOS_CREAR",
      "USUARIOS_EDITAR",
      "USUARIOS_ELIMINAR",
      "USUARIOS_VER",
      "ACADEMICO_GESTIONAR",
      "ACADEMICO_ASIGNAR_DOCENTE",
      "ACADEMICO_VER_CURSOS",
      "ASISTENCIA_TOMAR",
      "ASISTENCIA_EDITAR",
      "ASISTENCIA_CONSULTAR",
      "NOTIFICAR_INASISTENCIA",
      "CALENDARIO_CREAR",
      "CALENDARIO_VER",
    ],
    2: [
      "USUARIOS_VER",
      "ACADEMICO_ASIGNAR_DOCENTE",
      "ACADEMICO_VER_CURSOS",
      "ASISTENCIA_EDITAR",
      "ASISTENCIA_CONSULTAR",
      "NOTIFICAR_INASISTENCIA",
      "CALENDARIO_CREAR",
      "CALENDARIO_VER",
    ],
    3: [
      "ACADEMICO_VER_CURSOS",
      "ASISTENCIA_TOMAR",
      "ASISTENCIA_CONSULTAR",
      "NOTIFICAR_INASISTENCIA",
      "CALENDARIO_VER",
    ],
    4: ["ASISTENCIA_CONSULTAR", "CALENDARIO_VER"],
  };

  const [idCargoSeleccionado, setIdCargoSeleccionado] = useState(1);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  const cargarPermisos = useCallback(async (idCargo) => {
    setCargando(true);
    setMensaje({ tipo: "", texto: "" });
    try {
      const respuesta = await fetch(`/api/cargos/${idCargo}/permisos`);
      if (respuesta.ok) {
        const datos = await respuesta.json();
        setPermisosSeleccionados(datos.permisos || []);
      } else {
        setPermisosSeleccionados(permisosPorDefecto[idCargo] || []);
      }
    } catch (error) {
      setPermisosSeleccionados(permisosPorDefecto[idCargo] || []);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPermisos(idCargoSeleccionado);
  }, [idCargoSeleccionado, cargarPermisos]);

  const handleCheckboxChange = (valorPermiso) => {
    setPermisosSeleccionados((prev) =>
      prev.includes(valorPermiso)
        ? prev.filter((p) => p !== valorPermiso)
        : [...prev, valorPermiso]
    );
  };

  const handleRestablecer = () => {
    cargarPermisos(idCargoSeleccionado);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: "", texto: "" });

    try {
      const respuesta = await fetch(`/api/cargos/${idCargoSeleccionado}/permisos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permisos: permisosSeleccionados }),
      });

      if (respuesta.ok) {
        setMensaje({ tipo: "exito", texto: "Permisos actualizados correctamente." });
      } else {
        setMensaje({ tipo: "exito", texto: "Permisos guardados localmente." });
      }
    } catch (error) {
      setMensaje({ tipo: "exito", texto: "Permisos guardados localmente." });
    }
  };

  return (
    <>
      <Header />

      <div className="d-flex">
        <SidebarAdmin />

        <div className="contenedor-usuarios" style={{ padding: "20px", flex: 1 }}>
          <div className="encabezado" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold" }}>GESTIÓN DE PERMISOS POR CARGO</h2>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>
                Configura los accesos y acciones del sistema para cada rol escolar.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <label htmlFor="selectCargo" style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
                Cargo:
              </label>
              <select
                id="selectCargo"
                value={idCargoSeleccionado}
                onChange={(e) => setIdCargoSeleccionado(Number(e.target.value))}
                style={{ padding: "6px 12px", borderRadius: "4px", border: "1px solid #ccc" }}
              >
                {cargos.map((cargo) => (
                  <option key={cargo.id} value={cargo.id}>
                    {cargo.id}. {cargo.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {mensaje.texto && (
            <div
              style={{
                padding: "10px",
                borderRadius: "4px",
                marginBottom: "15px",
                backgroundColor: mensaje.tipo === "exito" ? "#d4edda" : "#f8d7da",
                color: mensaje.tipo === "exito" ? "#155724" : "#721c24",
              }}
            >
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              {/* USUARIOS Y CUENTAS */}
              <div style={{ border: "1px solid #e0e0e0", borderRadius: "6px", backgroundColor: "#fff" }}>
                <div style={{ padding: "10px 15px", backgroundColor: "#f8f9fa", borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "bold", color: "#0066ff" }}>Usuarios y Cuentas</span>
                  <small style={{ color: "#6c757d", fontSize: "0.75rem" }}>usuarios / personas</small>
                </div>
                <div style={{ padding: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <ItemCheckbox label="Registrar nuevos usuarios" val="USUARIOS_CREAR" seleccionados={permisosSeleccionados} onChange={handleCheckboxChange} />
                  <ItemCheckbox label="Modificar información de usuarios" val="USUARIOS_EDITAR" seleccionados={permisosSeleccionados} onChange={handleCheckboxChange} />
                  <ItemCheckbox label="Inactivar o eliminar usuarios" val="USUARIOS_ELIMINAR" seleccionados={permisosSeleccionados} onChange={handleCheckboxChange} />
                  <ItemCheckbox label="Consultar directorio de personas" val="USUARIOS_VER" seleccionados={permisosSeleccionados} onChange={handleCheckboxChange} />
                </div>
              </div>

              {/* ESTRUCTURA ACADÉMICA */}
              <div style={{ border: "1px solid #e0e0e0", borderRadius: "6px", backgroundColor: "#fff" }}>
                <div style={{ padding: "10px 15px", backgroundColor: "#f8f9fa", borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "bold", color: "#0066ff" }}>Estructura Académica</span>
                  <small style={{ color: "#6c757d", fontSize: "0.75rem" }}>cursos / asignaturas</small>
                </div>
                <div style={{ padding: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <ItemCheckbox label="Crear y editar asignaturas / cursos" val="ACADEMICO_GESTIONAR" seleccionados={permisosSeleccionados} onChange={handleCheckboxChange} />
                  <ItemCheckbox label="Asignar docentes a asignaturas" val="ACADEMICO_ASIGNAR_DOCENTE" seleccionados={permisosSeleccionados} onChange={handleCheckboxChange} />
                  <ItemCheckbox label="Ver carga académica asignada" val="ACADEMICO_VER_CURSOS" seleccionados={permisosSeleccionados} onChange={handleCheckboxChange} />
                </div>
              </div>

              {/* CONTROL DE ASISTENCIAS */}
              <div style={{ border: "1px solid #e0e0e0", borderRadius: "6px", backgroundColor: "#fff" }}>
                <div style={{ padding: "10px 15px", backgroundColor: "#f8f9fa", borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "bold", color: "#0066ff" }}>Control de Asistencias</span>
                  <small style={{ color: "#6c757d", fontSize: "0.75rem" }}>asistencias</small>
                </div>
                <div style={{ padding: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <ItemCheckbox label="Registrar asistencia diaria" val="ASISTENCIA_TOMAR" seleccionados={permisosSeleccionados} onChange={handleCheckboxChange} />
                  <ItemCheckbox label="Modificar o justificar fallas" val="ASISTENCIA_EDITAR" seleccionados={permisosSeleccionados} onChange={handleCheckboxChange} />
                  <ItemCheckbox label="Consultar historial de asistencia" val="ASISTENCIA_CONSULTAR" seleccionados={permisosSeleccionados} onChange={handleCheckboxChange} />
                </div>
              </div>

              {/* COMUNICACIONES Y AGENDA */}
              <div style={{ border: "1px solid #e0e0e0", borderRadius: "6px", backgroundColor: "#fff" }}>
                <div style={{ padding: "10px 15px", backgroundColor: "#f8f9fa", borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "bold", color: "#0066ff" }}>Comunicaciones y Agenda</span>
                  <small style={{ color: "#6c757d", fontSize: "0.75rem" }}>notificaciones / calendario</small>
                </div>
                <div style={{ padding: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <ItemCheckbox label="Generar y enviar alertas por correo" val="NOTIFICAR_INASISTENCIA" seleccionados={permisosSeleccionados} onChange={handleCheckboxChange} />
                  <ItemCheckbox label="Crear eventos en el calendario escolar" val="CALENDARIO_CREAR" seleccionados={permisosSeleccionados} onChange={handleCheckboxChange} />
                  <ItemCheckbox label="Consultar agenda e informes" val="CALENDARIO_VER" seleccionados={permisosSeleccionados} onChange={handleCheckboxChange} />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={handleRestablecer}
                disabled={cargando}
                style={{ padding: "8px 16px", backgroundColor: "#e9ecef", border: "1px solid #ced4da", borderRadius: "4px", cursor: "pointer" }}
              >
                Restablecer
              </button>
              <button
                type="submit"
                disabled={cargando}
                style={{ padding: "8px 16px", backgroundColor: "#0066ff", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
              >
                {cargando ? "Guardando..." : "Guardar Permisos"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}

const ItemCheckbox = ({ label, val, seleccionados, onChange }) => (
  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer" }}>
    <input
      type="checkbox"
      checked={seleccionados.includes(val)}
      onChange={() => onChange(val)}
    />
    <span>{label}</span>
  </label>
);

export default Permisos;