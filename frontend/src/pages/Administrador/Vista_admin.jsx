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
  
  const navigate = useNavigate();

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const data = await obtenerUsuarios();
      setUsuarios(data);
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

  const usuariosFiltrados = usuarios.filter((usuario) =>
    usuario.login?.toLowerCase().includes(busqueda.toLowerCase()) ||
    usuario.estado?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <Header />

      <div className="d-flex">
        <SidebarAdmin />

        <div className="contenedor-usuarios">
          <div className="encabezado">
            <h2>Gestión de Usuarios</h2>
            <input
              type="text"
              className="buscador"
              placeholder="Buscar por correo/login..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {cargando ? (
            <p>Cargando usuarios...</p>
          ) : (
            <table className="tabla-usuarios">
              <thead>
                <tr>
                  <th>Usuario (Correo)</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length > 0 ? (
                  usuariosFiltrados.map((u) => (
                    <tr key={u.id_usuario}>
                      <td>{u.login}</td>
                      <td>{u.estado}</td>
                      <td>
                        <button className="btn ver" onClick={() => navigate('/ver_usuario', { state: u })}>Ver</button>
                        
                        {/* Redirige a la pantalla de edición enviando los datos de este usuario */}
                        <button 
                          className="btn editar" 
                          onClick={() => navigate('/editar_usuario', { state: u })}
                        >
                          Editar
                        </button>

                        <button 
                          className="btn eliminar" 
                          onClick={() => handleEliminar(u.id_usuario)}
                        >
                          Eliminar
                        </button>
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
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Vista_admin;