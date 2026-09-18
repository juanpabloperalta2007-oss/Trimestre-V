import React, {
  useEffect,
  useState
} from "react";

import Layout from "./Layout";

import AlertasTable
  from "./AlertasTable";

import {
  obtenerAlertas
} from "../../services/api";


function Alertas() {

  const [alertas, setAlertas] =
    useState([]);


  const [estadisticas, setEstadisticas] =
    useState({

      total: 0,

      exceso: 0,

      perdida: 0

    });


  const [cargando, setCargando] =
    useState(true);


  const [error, setError] =
    useState("");


  // ======================================================
  // CARGAR ALERTAS
  // ======================================================

  const cargarAlertas = async () => {

    try {

      setCargando(true);

      setError("");


      const datos =
        await obtenerAlertas();


      console.log(
        "ALERTAS RECIBIDAS EN ALERTAS.JSX:",
        datos
      );


      if (!Array.isArray(datos)) {

        throw new Error(
          "El servidor no devolvió una lista de alertas."
        );

      }


      // ==================================================
      // NORMALIZAR
      // ==================================================

      const alertasProcesadas =
        datos.map((dato) => {

          const cantidad =
            Number(
              dato.inasistencias
            ) || 0;


          const estadoOriginal =
            String(
              dato.estado || ""
            )
              .toLowerCase()
              .trim();


          const esPerdida =
            estadoOriginal === "pérdida" ||
            estadoOriginal === "perdida" ||
            estadoOriginal === "pérdida de materia" ||
            estadoOriginal === "perdida de materia";


          return {

            ...dato,

            inasistencias:
              cantidad,

            estado:
              esPerdida
                ? "Pérdida"
                : "Exceso"

          };

        });


      // ==================================================
      // CONTADORES
      // ==================================================

      const total =
        alertasProcesadas.length;


      const exceso =
        alertasProcesadas.filter(
          (alerta) =>
            alerta.estado === "Exceso"
        ).length;


      const perdida =
        alertasProcesadas.filter(
          (alerta) =>
            alerta.estado === "Pérdida"
        ).length;


      console.log(
        "ESTADÍSTICAS FINALES:",
        {
          total,
          exceso,
          perdida
        }
      );


      // ==================================================
      // GUARDAR
      // ==================================================

      setAlertas(
        alertasProcesadas
      );


      setEstadisticas({

        total,

        exceso,

        perdida

      });


    } catch (error) {

      console.error(
        "ERROR AL CARGAR ALERTAS:",
        error
      );


      setError(

        error.response?.data?.error ||

        error.message ||

        "No fue posible cargar las alertas."

      );


      setAlertas([]);


      setEstadisticas({

        total: 0,

        exceso: 0,

        perdida: 0

      });

    } finally {

      setCargando(false);

    }

  };


  // ======================================================
  // AL INICIAR
  // ======================================================

  useEffect(() => {

    cargarAlertas();

  }, []);


  // ======================================================
  // CARGANDO
  // ======================================================

  if (cargando) {

    return (

      <Layout titulo="Alertas de Inasistencia">

        <div className="text-center py-5">

          <div
            className="spinner-border text-primary"
            role="status"
          ></div>

          <p className="mt-3">
            Cargando alertas...
          </p>

        </div>

      </Layout>

    );

  }


  // ======================================================
  // ERROR
  // ======================================================

  if (error) {

    return (

      <Layout titulo="Alertas de Inasistencia">

        <div className="alert alert-danger">

          <strong>
            Error:
          </strong>{" "}

          {error}

        </div>


        <button
          className="btn btn-primary"
          onClick={cargarAlertas}
        >

          Intentar nuevamente

        </button>

      </Layout>

    );

  }


  // ======================================================
  // VISTA
  // ======================================================

  return (

    <Layout titulo="Alertas de Inasistencia">


      {/* ==================================================
          TARJETAS
      ================================================== */}

      <div className="row mb-4">


        {/* TOTAL */}

        <div className="col-md-4 mb-3">

          <div className="card border-primary shadow-sm h-100">

            <div className="card-body text-center">

              <i className="bi bi-bell-fill text-primary fs-1"></i>


              <h3 className="mt-3">

                {estadisticas.total}

              </h3>


              <p className="mb-0 fw-bold">

                Total Alertas

              </p>

            </div>

          </div>

        </div>


        {/* EXCESO */}

        <div className="col-md-4 mb-3">

          <div className="card border-warning shadow-sm h-100">

            <div className="card-body text-center">

              <i className="bi bi-exclamation-circle-fill text-warning fs-1"></i>


              <h3 className="mt-3">

                {estadisticas.exceso}

              </h3>


              <p className="mb-0 fw-bold">

                Exceso de Inasistencias

              </p>

            </div>

          </div>

        </div>


        {/* PÉRDIDA */}

        <div className="col-md-4 mb-3">

          <div className="card border-danger shadow-sm h-100">

            <div className="card-body text-center">

              <i className="bi bi-x-circle-fill text-danger fs-1"></i>


              <h3 className="mt-3">

                {estadisticas.perdida}

              </h3>


              <p className="mb-0 fw-bold">

                Pérdida de Materia

              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ==================================================
          TABLA
      ================================================== */}

      <AlertasTable
        alertas={alertas}
      />

    </Layout>

  );

}


export default Alertas;