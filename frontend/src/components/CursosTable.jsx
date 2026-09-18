import { useEffect, useState } from "react";

import {
  obtenerCursos,
  obtenerInasistencias,
} from "../services/api";


function CursosTable() {

  // =====================================================
  // ESTADOS
  // =====================================================

  const [cursos, setCursos] = useState([]);

  const [inasistencias, setInasistencias] = useState([]);

  const [cursoSeleccionado, setCursoSeleccionado] = useState("");

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");


  // =====================================================
  // CARGAR DATOS
  // =====================================================

  useEffect(() => {

    cargarDatos();

  }, []);


  async function cargarDatos() {

    setCargando(true);
    setError("");

    // ===================================================
    // OBTENER CURSOS
    // ===================================================

    try {

      const respuestaCursos =
        await obtenerCursos();

      console.log(
        "CURSOS RECIBIDOS:",
        respuestaCursos
      );


      let cursosProcesados = [];


      if (Array.isArray(respuestaCursos)) {

        cursosProcesados =
          respuestaCursos;

      } else if (
        respuestaCursos &&
        Array.isArray(respuestaCursos.cursos)
      ) {

        cursosProcesados =
          respuestaCursos.cursos;

      } else if (
        respuestaCursos &&
        Array.isArray(respuestaCursos.data)
      ) {

        cursosProcesados =
          respuestaCursos.data;

      }


      console.log(
        "CURSOS PROCESADOS:",
        cursosProcesados
      );


      setCursos(cursosProcesados);

    } catch (error) {

      console.error(
        "ERROR AL CARGAR CURSOS:",
        error
      );

      setCursos([]);

      setError(
        "No fue posible cargar los cursos."
      );

    }


    // ===================================================
    // OBTENER INASISTENCIAS
    // ===================================================

    try {

      const respuestaInasistencias =
        await obtenerInasistencias();

      console.log(
        "INASISTENCIAS RECIBIDAS:",
        respuestaInasistencias
      );


      let inasistenciasProcesadas = [];


      if (Array.isArray(respuestaInasistencias)) {

        inasistenciasProcesadas =
          respuestaInasistencias;

      } else if (
        respuestaInasistencias &&
        Array.isArray(
          respuestaInasistencias.alertas
        )
      ) {

        inasistenciasProcesadas =
          respuestaInasistencias.alertas;

      } else if (
        respuestaInasistencias &&
        Array.isArray(
          respuestaInasistencias.asistencias
        )
      ) {

        inasistenciasProcesadas =
          respuestaInasistencias.asistencias;

      } else if (
        respuestaInasistencias &&
        Array.isArray(
          respuestaInasistencias.data
        )
      ) {

        inasistenciasProcesadas =
          respuestaInasistencias.data;

      }


      console.log(
        "INASISTENCIAS PROCESADAS:",
        inasistenciasProcesadas
      );


      setInasistencias(
        inasistenciasProcesadas
      );

    } catch (error) {

      console.error(
        "ERROR AL CARGAR INASISTENCIAS:",
        error
      );

      // Importante:
      // No borramos los cursos si falla
      // la consulta de inasistencias.

      setInasistencias([]);

    }


    setCargando(false);

  }


  // =====================================================
  // OBTENER ID DEL CURSO
  // =====================================================

  function obtenerIdCurso(curso) {

    return (
      curso.id_curso ??
      curso.id ??
      curso.codigo ??
      curso.nombre_curso ??
      ""
    );

  }


  // =====================================================
  // OBTENER NOMBRE DEL CURSO
  // =====================================================

  function obtenerNombreCurso(curso) {

    return (
      curso.nombre_curso ??
      curso.nombre ??
      curso.descripcion ??
      `Curso ${obtenerIdCurso(curso)}`
    );

  }


  // =====================================================
  // COMPROBAR SI UNA INASISTENCIA PERTENECE AL CURSO
  // =====================================================

  function perteneceAlCurso(
    inasistencia,
    cursoSeleccionado
  ) {

    if (!cursoSeleccionado) {
      return false;
    }


    /*
    -----------------------------------------------------
    El backend actualmente devuelve algo como:

    curso: "601, 602"

    El selector puede tener:

    cursoSeleccionado: "601"

    Entonces debemos separar los cursos.
    -----------------------------------------------------
    */

    const curso =
      inasistencia.curso ??
      inasistencia.nombre_curso ??
      inasistencia.id_curso ??
      inasistencia.id_asignatura_curso ??
      "";


    const cursosDeLaInasistencia =
      String(curso)
        .split(",")
        .map((valor) =>
          valor.trim().toLowerCase()
        )
        .filter(Boolean);


    const seleccionado =
      String(cursoSeleccionado)
        .trim()
        .toLowerCase();


    /*
    -----------------------------------------------------
    Comparación directa
    -----------------------------------------------------
    */

    if (
      cursosDeLaInasistencia.includes(
        seleccionado
      )
    ) {

      return true;

    }


    /*
    -----------------------------------------------------
    Comparar también por nombre del curso
    -----------------------------------------------------
    */

    const cursoSeleccionadoObjeto =
      cursos.find(
        (cursoActual) =>
          String(
            obtenerIdCurso(cursoActual)
          ) ===
          String(cursoSeleccionado)
      );


    if (cursoSeleccionadoObjeto) {

      const nombre =
        obtenerNombreCurso(
          cursoSeleccionadoObjeto
        )
          .trim()
          .toLowerCase();


      if (
        cursosDeLaInasistencia.includes(
          nombre
        )
      ) {

        return true;

      }

    }


    return false;

  }


  // =====================================================
  // FILTRAR INASISTENCIAS
  // =====================================================

  const lista =
    inasistencias.filter(
      (inasistencia) =>
        perteneceAlCurso(
          inasistencia,
          cursoSeleccionado
        )
    );


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="alert alert-danger">

          <i className="bi bi-exclamation-triangle-fill me-2"></i>

          {error}

        </div>

      )}


      {/* =================================================
          CARD DE CURSOS
      ================================================= */}

      <div className="card shadow mb-4">

        <div className="card-header bg-primary text-white">

          <h5 className="mb-0">
            Cursos
          </h5>

        </div>


        <div className="card-body">

          {cargando ? (

            <div className="text-center py-3">

              <div
                className="spinner-border text-primary"
                role="status"
              >
              </div>

              <p className="mt-2 mb-0">
                Cargando cursos...
              </p>

            </div>

          ) : (

            <select
              className="form-select"
              value={cursoSeleccionado}
              onChange={(e) =>
                setCursoSeleccionado(
                  e.target.value
                )
              }
            >

              <option value="">
                Seleccione un curso
              </option>


              {cursos.map((curso) => {

                const idCurso =
                  obtenerIdCurso(curso);

                const nombreCurso =
                  obtenerNombreCurso(curso);


                return (

                  <option
                    key={idCurso}
                    value={idCurso}
                  >

                    {nombreCurso}

                  </option>

                );

              })}

            </select>

          )}


          {!cargando &&
            cursos.length === 0 &&
            !error && (

              <div className="alert alert-warning mt-3 mb-0">

                No hay cursos registrados.

              </div>

            )}

        </div>

      </div>


      {/* =================================================
          INASISTENCIAS DEL CURSO
      ================================================= */}

      {cursoSeleccionado && (

        <div className="card shadow">

          <div className="card-header bg-success text-white">

            <div className="d-flex justify-content-between align-items-center">

              <span>
                Inasistencias del curso
              </span>

              <span className="badge bg-light text-success">

                {lista.length}

              </span>

            </div>

          </div>


          <div className="card-body">

            {lista.length === 0 ? (

              <div className="alert alert-info mb-0">

                No hay inasistencias registradas
                para este curso.

              </div>

            ) : (

              <div className="table-responsive">

                <table className="table table-hover align-middle">

                  <thead className="table-light">

                    <tr>

                      <th>
                        Documento
                      </th>

                      <th>
                        Estudiante
                      </th>

                      <th>
                        Curso
                      </th>

                      <th className="text-center">
                        Inasistencias
                      </th>

                      <th className="text-center">
                        Tardanzas
                      </th>

                      <th>
                        Estado
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {lista.map(
                      (inasistencia) => {

                        const id =
                          inasistencia.id_estudiante ??
                          inasistencia.id ??
                          Math.random();


                        const nombre =
                          inasistencia.estudiante ??
                          inasistencia.nombre_estudiante ??
                          "Estudiante";


                        const documento =
                          inasistencia.documento ??
                          inasistencia.numero_documento ??
                          "Sin documento";


                        const cantidad =
                          Number(
                            inasistencia.inasistencias ??
                            0
                          );


                        const tardanzas =
                          Number(
                            inasistencia.tardanzas ??
                            0
                          );


                        const estado =
                          inasistencia.estado ??
                          "Seguimiento";


                        return (

                          <tr key={id}>

                            {/* DOCUMENTO */}

                            <td>

                              {documento}

                            </td>


                            {/* ESTUDIANTE */}

                            <td>

                              <strong>

                                {nombre}

                              </strong>

                            </td>


                            {/* CURSO */}

                            <td>

                              <span className="badge bg-info text-dark">

                                {
                                  inasistencia.curso ??
                                  "Sin curso"
                                }

                              </span>

                            </td>


                            {/* INASISTENCIAS */}

                            <td className="text-center">

                              <span
                                className={
                                  cantidad >= 10
                                    ? "badge bg-danger fs-6"
                                    : cantidad >= 5
                                      ? "badge bg-warning text-dark fs-6"
                                      : "badge bg-secondary fs-6"
                                }
                              >

                                {cantidad}

                              </span>

                            </td>


                            {/* TARDANZAS */}

                            <td className="text-center">

                              <span className="badge bg-secondary fs-6">

                                {tardanzas}

                              </span>

                            </td>


                            {/* ESTADO */}

                            <td>

                              <span
                                className={
                                  estado === "Pérdida"
                                    ? "badge bg-danger"
                                    : estado === "Exceso"
                                      ? "badge bg-warning text-dark"
                                      : "badge bg-secondary"
                                }
                              >

                                {estado}

                              </span>

                            </td>

                          </tr>

                        );

                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

      )}

    </>

  );

}


export default CursosTable;