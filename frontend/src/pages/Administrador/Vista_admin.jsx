import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import SidebarAdmin from "../../components/SidebarAdmin";
import { obtenerUsuarios, eliminarUsuario } from "../../services/api";
import "../../styles/GestionUsuario.css";

function Vista_admin() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  // ==========================================
  // ESTADOS PARA PAGINACIÓN
  // ==========================================
  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 10; // Muestra 5 usuarios por página

  const navigate = useNavigate();

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const res = await obtenerUsuarios();
      const lista = Array.isArray(res) ? res : (res.usuarios || []);
      setUsuarios(lista);
    } catch (error) {
      console.error("Error al cargar los usuarios:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await eliminarUsuario(id);
        cargarUsuarios();
      } catch (error) {
        console.error("Error al eliminar el usuario:", error);
      }
    }
  };

  // Manejar cambio en la búsqueda y reiniciar a la primera página
  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
    setPaginaActual(1);
  };

  // 1. Filtrar lista según el campo de búsqueda
  const usuariosFiltrados = usuarios.filter((usuario) =>
    usuario.login?.toLowerCase().includes(busqueda.toLowerCase()) ||
    usuario.estado?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // 2. Calcular subcorte para paginación
  const indiceUltimo = paginaActual * usuariosPorPagina;
  const indicePrimero = indiceUltimo - usuariosPorPagina;
  const usuariosPaginados = usuariosFiltrados.slice(indicePrimero, indiceUltimo);

  // 3. Cantidad total de páginas
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

  return (
    <>
      <Header />

      <div className="d-flex">
        <SidebarAdmin />

        <div className="contenedor-usuarios" style={{ flex: 1, padding: "20px" }}>
          <div className="encabezado">
            <h2>Gestión de Usuarios</h2>
            <input
              type="text"
              className="buscador"
              placeholder="Buscar por correo/login..."
              value={busqueda}
              onChange={handleBusquedaChange}
            />
          </div>

          {cargando ? (
            <p>Cargando usuarios...</p>
          ) : (
            <>
              <table className="tabla-usuarios">
                <thead>
                  <tr>
                    <th>Usuario (Correo)</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosPaginados.length > 0 ? (
                    usuariosPaginados.map((u) => (
                      <tr key={u.id_usuario}>
                        <td>{u.login}</td>
                        <td>{u.estado}</td>
                        <td style={{ width: "220px", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                            <button 
                              className="btn ver" 
                              style={{ width: "auto", padding: "5px 12px" }}
                              onClick={() => navigate('/ver_usuario', { state: u })}
                            >
                              Ver
                            </button>
                            
                            <button 
                              className="btn editar" 
                              style={{ width: "auto", padding: "5px 12px" }}
                              onClick={() => navigate('/editar_usuario', { state: u })}
                            >
                              Editar
                            </button>

                            <button 
                              className="btn eliminar" 
                              style={{ 
                                width: "auto", 
                                padding: "5px 12px", 
                                backgroundColor: "#dc3545", 
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "4px"
                              }}
                              onClick={() => handleEliminar(u.id_usuario)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center" }}>
                        No se encontraron usuarios.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* CONTROLES DE PAGINACIÓN */}
              {totalPaginas > 1 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px" }}>
                  <small style={{ color: "#6c757d" }}>
                    Mostrando {indicePrimero + 1} a {Math.min(indiceUltimo, usuariosFiltrados.length)} de {usuariosFiltrados.length} usuarios
                  </small>

                  <div style={{ display: "flex", gap: "5px" }}>
                    <button
                      className="btn"
                      style={{ padding: "5px 10px", fontSize: "14px" }}
                      disabled={paginaActual === 1}
                      onClick={() => setPaginaActual(paginaActual - 1)}
                    >
                      Anterior
                    </button>

                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        className="btn"
                        style={{
                          padding: "5px 10px",
                          fontSize: "14px",
                          backgroundColor: paginaActual === num ? "#0d6efd" : "#e9ecef",
                          color: paginaActual === num ? "#ffffff" : "#000000",
                          border: "none",
                          borderRadius: "4px"
                        }}
                        onClick={() => setPaginaActual(num)}
                      >
                        {num}
                      </button>
                    ))}

                    <button
                      className="btn"
                      style={{ padding: "5px 10px", fontSize: "14px" }}
                      disabled={paginaActual === totalPaginas}
                      onClick={() => setPaginaActual(paginaActual + 1)}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Vista_admin;