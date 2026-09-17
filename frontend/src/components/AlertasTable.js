import React, { useEffect, useState } from "react";
import {
  obtenerInasistencias,
  enviarCorreo
} from "../services/api";

function AlertasTable() {

  const [alertas, setAlertas] = useState([]);

  const [cargando, setCargando] = useState(true);

  const [enviando, setEnviando] = useState(null);


  // ======================================================
  // CARGAR ALERTAS
  // ======================================================

  const cargarAlertas = async () => {

    try {

      setCargando(true);

      const asistencias =
        await obtenerInasistencias();


      console.log(
        "ASISTENCIAS RECIBIDAS EN TABLA:",
        asistencias
      );


      if (!Array.isArray(asistencias)) {

        setAlertas([]);

        return;

      }


      // ==================================================
      // SOLO AUSENTES
      // ==================================================

      const ausencias =
        asistencias.filter((asistencia) => {

          return String(
            asistencia.estado || ""
          )
            .trim()
            .toLowerCase() === "ausente";

        });


      console.log(
        "AUSENCIAS EN TABLA:",
        ausencias
      );


      // ==================================================
      // AGRUPAR POR ESTUDIANTE
      // ==================================================

      const agrupadas = {};


      ausencias.forEach((asistencia) => {

        const idEstudiante =
          asistencia.id_estudiante;


        if (!idEstudiante) {
          return;
        }


        if (!agrupadas[idEstudiante]) {

          const nombreCompleto = [

            asistencia.primer_nombre,

            asistencia.segundo_nombre,

            asistencia.primer_apellido,

            asistencia.segundo_apellido

          ]
            .filter(Boolean)
            .join(" ")
            .trim();


          agrupadas[idEstudiante] = {

            id_estudiante:
              idEstudiante,

            estudiante:
              nombreCompleto ||
              asistencia.estudiante ||
              "Sin nombre",

            documento:
              asistencia.numero_documento ||
              asistencia.documento ||
              "Sin documento",

            curso:
              asistencia.nombre_curso ||
              asistencia.curso ||
              "Sin curso",

            inasistencias: 0,

            id_docente:
              asistencia.id_docente ||
              null,

            id_acudiente:
              asistencia.id_acudiente ||
              null

          };

        }


        agrupadas[idEstudiante]
          .inasistencias += 1;

      });


      // ==================================================
      // GENERAR ALERTAS
      // ==================================================

      const resultado =
        Object.values(agrupadas)
          .filter((estudiante) => {

            // ALERTA A PARTIR DE 3 AUSENCIAS
            return estudiante.inasistencias >= 3;

          })
          .map((estudiante) => {

            let estado = "Exceso";


            // 5 O MÁS = PÉRDIDA
            if (
              estudiante.inasistencias >= 5
            ) {

              estado = "Pérdida";

            }


            return {

              ...estudiante,

              estado

            };

          });


      console.log(
        "ALERTAS GENERADAS EN TABLA:",
        resultado
      );


      setAlertas(resultado);


    } catch (error) {

      console.error(
        "ERROR CARGANDO ALERTAS EN TABLA:",
        error
      );

      setAlertas([]);

    } finally {

      setCargando(false);

    }

  };


  // ======================================================
  // CARGAR AL INICIAR
  // ======================================================

  useEffect(() => {

    cargarAlertas();

  }, []);


  // ======================================================
  // ENVIAR AVISO
  // ======================================================

  const enviarAviso = async (alerta) => {

    try {

      setEnviando(
        alerta.id_estudiante
      );


      await enviarCorreo({

        asunto:
          "Alerta de inasistencia",

        mensaje:
          `El estudiante ${alerta.estudiante} ` +
          `registra ${alerta.inasistencias} ` +
          `inasistencias en el curso ` +
          `${alerta.curso}.`,

        tipo:
          "Alerta",

        estado:
          "Enviado",

        id_estudiante:
          alerta.id_estudiante,

        id_acudiente:
          alerta.id_acudiente,

        id_docente:
          alerta.id_docente

      });


      alert(
        "Aviso enviado correctamente."
      );


    } catch (error) {

      console.error(
        "ERROR ENVIANDO AVISO:",
        error
      );


      alert(
        error.response?.data?.error ||
        "No fue posible enviar el aviso."
      );


    } finally {

      setEnviando(null);

    }

  };


  // ======================================================
  // CARGANDO
  // ======================================================

  if (cargando) {

    return (

      <div className="card shadow-sm">

        <div className="card-header bg-primary text-white">

          <h5 className="mb-0">
            Alertas de Inasistencia
          </h5>

        </div>

        <div className="card-body text-center py-5">

          <div
            className="spinner-border text-primary"
            role="status"
          ></div>

          <p className="mt-3 mb-0">
            Cargando alertas...
          </p>

        </div>

      </div>

    );

  }


  // ======================================================
  // SIN ALERTAS
  // ======================================================

  if (alertas.length === 0) {

    return (

      <div className="card shadow-sm">

        <div className="card-header bg-primary text-white">

          <h5 className="mb-0">
            Alertas de Inasistencia
          </h5>

        </div>


        <div className="card-body text-center py-5">

          <h5>
            No hay alertas
          </h5>

          <p className="text-muted mb-0">

            Actualmente no hay estudiantes
            con exceso de inasistencias.

          </p>

        </div>

      </div>

    );

  }


  // ======================================================
  // TABLA
  // ======================================================

  return (

    <div className="card shadow-sm">

      <div className="card-header bg-primary text-white">

        <h5 className="mb-0">
          Alertas de Inasistencia
        </h5>

      </div>


      <div className="table-responsive">

        <table className="table table-bordered table-hover mb-0">

          <thead className="table-light">

            <tr>

              <th>
                Estudiante
              </th>

              <th>
                Documento
              </th>

              <th>
                Curso
              </th>

              <th className="text-center">
                Inasistencias
              </th>

              <th className="text-center">
                Estado
              </th>

              <th className="text-center">
                Acciones
              </th>

            </tr>

          </thead>


          <tbody>

            {alertas.map((alerta) => (

              <tr
                key={alerta.id_estudiante}
              >

                {/* ESTUDIANTE */}

                <td>

                  <strong>
                    {alerta.estudiante}
                  </strong>

                </td>


                {/* DOCUMENTO */}

                <td>

                  {alerta.documento}

                </td>


                {/* CURSO */}

                <td>

                  {alerta.curso}

                </td>


                {/* INASISTENCIAS */}

                <td className="text-center">

                  <span
                    className="badge bg-danger"
                    style={{
                      fontSize: "14px",
                      padding: "8px 12px"
                    }}
                  >

                    {alerta.inasistencias}

                  </span>

                </td>


                {/* ESTADO */}

                <td className="text-center">

                  {alerta.estado === "Pérdida" ? (

                    <span
                      className="badge bg-danger"
                      style={{
                        fontSize: "13px",
                        padding: "8px 12px"
                      }}
                    >

                      Pérdida

                    </span>

                  ) : (

                    <span
                      className="badge bg-warning text-dark"
                      style={{
                        fontSize: "13px",
                        padding: "8px 12px"
                      }}
                    >

                      Exceso

                    </span>

                  )}

                </td>


                {/* ACCIONES */}

                <td className="text-center">

                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    style={{
                      minWidth: "120px",
                      fontWeight: "bold"
                    }}
                    disabled={
                      enviando ===
                      alerta.id_estudiante
                    }
                    onClick={() =>
                      enviarAviso(alerta)
                    }
                  >

                    {enviando ===
                    alerta.id_estudiante

                      ? "Enviando..."

                      : "Enviar aviso"}

                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>


      <div className="card-footer text-muted">

        Total de alertas:{" "}

        <strong>
          {alertas.length}
        </strong>

      </div>

    </div>

  );

}

export default AlertasTable;