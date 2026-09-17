import React, { useEffect, useState } from "react";

import {
  obtenerNotificaciones,
  eliminarNotificacion,
} from "../services/api";


function NotificacionesTable() {

  // ======================================================
  // ESTADOS
  // ======================================================

  const [notificaciones, setNotificaciones] = useState([]);

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");

  const [eliminando, setEliminando] = useState(null);


  // ======================================================
  // CARGAR NOTIFICACIONES
  // ======================================================

  const cargarNotificaciones = async () => {

    try {

      setCargando(true);

      setError("");

      const respuesta = await obtenerNotificaciones();

      console.log(
        "NOTIFICACIONES RECIBIDAS:",
        respuesta
      );


      // --------------------------------------------------
      // NORMALIZAR RESPUESTA
      // --------------------------------------------------

      let datos = [];

      if (Array.isArray(respuesta)) {

        datos = respuesta;

      } else if (
        respuesta &&
        Array.isArray(respuesta.notificaciones)
      ) {

        datos = respuesta.notificaciones;

      } else if (
        respuesta &&
        Array.isArray(respuesta.data)
      ) {

        datos = respuesta.data;

      }


      setNotificaciones(datos);


    } catch (error) {

      console.error(
        "ERROR AL CARGAR NOTIFICACIONES:",
        error
      );


      setError(
        error.response?.data?.error ||
        error.message ||
        "No fue posible cargar las notificaciones."
      );


      setNotificaciones([]);

    } finally {

      setCargando(false);

    }

  };


  // ======================================================
  // CARGAR AL ABRIR LA PÁGINA
  // ======================================================

  useEffect(() => {

    cargarNotificaciones();

  }, []);


  // ======================================================
  // OBTENER ID
  // ======================================================

  const obtenerId = (notificacion) => {

    return (
      notificacion.id_notificacion ??
      notificacion.id ??
      notificacion.id_correo ??
      null
    );

  };


  // ======================================================
  // ELIMINAR NOTIFICACIÓN
  // ======================================================

  const eliminar = async (notificacion) => {

    const id = obtenerId(notificacion);


    // --------------------------------------------------
    // VALIDAR ID
    // --------------------------------------------------

    if (
      id === null ||
      id === undefined ||
      id === ""
    ) {

      alert(
        "No se encontró el ID de la notificación."
      );

      console.error(
        "NOTIFICACIÓN SIN ID:",
        notificacion
      );

      return;

    }


    // --------------------------------------------------
    // CONFIRMACIÓN
    // --------------------------------------------------

    const confirmar = window.confirm(
      "¿Está seguro de eliminar esta notificación?"
    );


    if (!confirmar) {

      return;

    }


    try {

      setEliminando(id);


      console.log(
        "ELIMINANDO NOTIFICACIÓN ID:",
        id
      );


      // ------------------------------------------------
      // LLAMAR AL BACKEND
      // ------------------------------------------------

      await eliminarNotificacion(id);


      // ------------------------------------------------
      // QUITAR DE LA TABLA
      // ------------------------------------------------

      setNotificaciones((actuales) => {

        return actuales.filter((item) => {

          const idItem = obtenerId(item);

          return String(idItem) !== String(id);

        });

      });


      console.log(
        "NOTIFICACIÓN ELIMINADA CORRECTAMENTE"
      );


    } catch (error) {

      console.error(
        "ERROR AL ELIMINAR NOTIFICACIÓN:",
        error
      );


      alert(
        error.response?.data?.error ||
        error.message ||
        "No fue posible eliminar la notificación."
      );


    } finally {

      setEliminando(null);

    }

  };


  // ======================================================
  // CARGANDO
  // ======================================================

  if (cargando) {

    return (

      <div className="card shadow-sm">

        <div
          className="card-header text-white"
          style={{
            backgroundColor: "#0d6efd",
          }}
        >

          <h5 className="mb-0">
            Notificaciones
          </h5>

        </div>


        <div className="card-body text-center py-5">

          <div
            className="spinner-border text-primary"
            role="status"
          >

            <span className="visually-hidden">
              Cargando...
            </span>

          </div>


          <p className="mt-3 mb-0">
            Cargando notificaciones...
          </p>

        </div>

      </div>

    );

  }


  // ======================================================
  // ERROR
  // ======================================================

  if (error) {

    return (

      <div className="card shadow-sm">

        <div
          className="card-header text-white"
          style={{
            backgroundColor: "#0d6efd",
          }}
        >

          <h5 className="mb-0">
            Notificaciones
          </h5>

        </div>


        <div className="card-body">

          <div className="alert alert-danger">

            <strong>Error:</strong>{" "}

            {error}

          </div>


          <button
            type="button"
            className="btn btn-primary"
            onClick={cargarNotificaciones}
          >

            Intentar nuevamente

          </button>

        </div>

      </div>

    );

  }


  // ======================================================
  // VISTA PRINCIPAL
  // ======================================================

  return (

    <div className="card shadow-sm">


      {/* ==================================================
          ENCABEZADO
      ================================================== */}

      <div
        className="card-header text-white"
        style={{
          backgroundColor: "#0d6efd",
        }}
      >

        <h5 className="mb-0">
          Notificaciones
        </h5>

      </div>


      {/* ==================================================
          SI NO HAY NOTIFICACIONES
      ================================================== */}

      {notificaciones.length === 0 ? (

        <div className="card-body text-center py-5">

          <h5 className="mb-3">
            No hay notificaciones
          </h5>

          <p className="text-muted mb-0">
            Actualmente no hay notificaciones registradas.
          </p>

        </div>

      ) : (


        /* =================================================
           TABLA
        ================================================= */

        <div className="table-responsive">

          <table className="table table-hover table-bordered mb-0">

            {/* ==============================================
                CABECERA
            ============================================== */}

            <thead className="table-light">

              <tr>

                <th>
                  ID
                </th>

                <th>
                  Asunto
                </th>

                <th>
                  Mensaje
                </th>

                <th>
                  Tipo
                </th>

                <th>
                  Estado
                </th>

                <th>
                  Fecha
                </th>

                <th
                  className="text-center"
                  style={{
                    minWidth: "120px",
                  }}
                >
                  Acciones
                </th>

              </tr>

            </thead>


            {/* ==============================================
                CUERPO
            ============================================== */}

            <tbody>

              {notificaciones.map(
                (notificacion, index) => {

                  const id =
                    obtenerId(notificacion);


                  const asunto =
                    notificacion.asunto ||
                    "Sin asunto";


                  const mensaje =
                    notificacion.mensaje ||
                    "Sin mensaje";


                  const tipo =
                    notificacion.tipo ||
                    "Sin tipo";


                  const estado =
                    notificacion.estado ||
                    "Pendiente";


                  const fecha =
                    notificacion.fecha ||
                    notificacion.fecha_envio ||
                    notificacion.created_at ||
                    null;


                  return (

                    <tr
                      key={
                        id !== null
                          ? id
                          : index
                      }
                    >


                      {/* ==================================
                          ID
                      ================================== */}

                      <td>

                        {id ?? "-"}

                      </td>


                      {/* ==================================
                          ASUNTO
                      ================================== */}

                      <td>

                        {asunto}

                      </td>


                      {/* ==================================
                          MENSAJE
                      ================================== */}

                      <td>

                        {mensaje}

                      </td>


                      {/* ==================================
                          TIPO
                      ================================== */}

                      <td>

                        {tipo}

                      </td>


                      {/* ==================================
                          ESTADO
                      ================================== */}

                      <td>

                        <span
                          className={
                            String(estado)
                              .toLowerCase()
                              .trim() === "enviado"
                              ? "badge bg-success"
                              : "badge bg-secondary"
                          }
                          style={{
                            fontSize: "13px",
                          }}
                        >

                          {estado}

                        </span>

                      </td>


                      {/* ==================================
                          FECHA
                      ================================== */}

                      <td>

                        {fecha
                          ? new Date(
                              fecha
                            ).toLocaleString(
                              "es-CO"
                            )
                          : "Sin fecha"}

                      </td>


                      {/* ==================================
                          ACCIONES
                      ================================== */}

                      <td className="text-center">

                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            eliminar(
                              notificacion
                            )
                          }
                          disabled={
                            eliminando === id
                          }
                          title="Eliminar notificación"
                          style={{
                            minWidth: "95px",
                            height: "36px",
                            backgroundColor:
                              "#dc3545",
                            borderColor:
                              "#dc3545",
                            color: "#ffffff",
                            fontWeight: "bold",
                            fontSize: "13px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding:
                              "6px 10px",
                            opacity:
                              eliminando === id
                                ? 0.65
                                : 1,
                          }}
                        >

                          {eliminando === id
                            ? "ELIMINANDO..."
                            : "ELIMINAR"}

                        </button>

                      </td>

                    </tr>

                  );

                }
              )}

            </tbody>

          </table>

        </div>

      )}


      {/* ==================================================
          PIE DE TABLA
      ================================================== */}

      {notificaciones.length > 0 && (

        <div className="card-footer text-muted">

          Total de notificaciones:{" "}

          <strong>
            {notificaciones.length}
          </strong>

        </div>

      )}

    </div>

  );

}


export default NotificacionesTable;