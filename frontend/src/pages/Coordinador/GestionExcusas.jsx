import { useEffect, useState } from "react";
import Layout from "../../components/Layout";

import {
    obtenerExcusas,
    aprobarExcusa,
    rechazarExcusa
} from "../../services/api";


function GestionExcusas() {

    const [excusas, setExcusas] = useState([]);

    const [cargando, setCargando] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        cargarExcusas();

    }, []);


    async function cargarExcusas() {

        try {

            setCargando(true);

            setError("");

            const datos = await obtenerExcusas();

            console.log("EXCUSAS RECIBIDAS:", datos);

            setExcusas(
                Array.isArray(datos)
                    ? datos
                    : []
            );

        } catch (error) {

            console.error(
                "Error cargando excusas:",
                error
            );

            setError(
                "No fue posible cargar las excusas."
            );

        } finally {

            setCargando(false);

        }
    }


    async function aprobar(id) {

        const confirmar = window.confirm(
            "¿Desea aprobar esta excusa?"
        );

        if (!confirmar) {
            return;
        }

        try {

            await aprobarExcusa(id);

            await cargarExcusas();

        } catch (error) {

            console.error(
                "Error aprobando excusa:",
                error
            );

            alert(
                "No fue posible aprobar la excusa."
            );
        }
    }


    async function rechazar(id) {

        const confirmar = window.confirm(
            "¿Desea rechazar esta excusa?"
        );

        if (!confirmar) {
            return;
        }

        try {

            await rechazarExcusa(id);

            await cargarExcusas();

        } catch (error) {

            console.error(
                "Error rechazando excusa:",
                error
            );

            alert(
                "No fue posible rechazar la excusa."
            );
        }
    }


    function obtenerBadgeEstado(estado) {

        if (estado === "Aprobada") {

            return (
                <span className="badge bg-success">
                    Aprobada
                </span>
            );
        }

        if (estado === "Rechazada") {

            return (
                <span className="badge bg-danger">
                    Rechazada
                </span>
            );
        }

        return (
            <span className="badge bg-warning text-dark">
                Pendiente
            </span>
        );
    }


    return (

        <Layout titulo="Gestión de Excusas">

            <div className="card shadow border-0">

                <div className="card-header bg-primary text-white">

                    <h5 className="mb-0">
                        Administración de excusas
                    </h5>

                </div>


                <div className="card-body">

                    {cargando && (

                        <div className="alert alert-secondary">

                            Cargando excusas...

                        </div>

                    )}


                    {error && (

                        <div className="alert alert-danger">

                            {error}

                        </div>

                    )}


                    {!cargando &&
                        !error &&
                        excusas.length === 0 && (

                            <div className="alert alert-info">

                                No hay excusas registradas.

                            </div>
                        )}


                    {!cargando &&
                        !error &&
                        excusas.length > 0 && (

                            <div className="table-responsive">

                                <table className="table table-hover align-middle">

                                    <thead className="table-dark">

                                        <tr>

                                            <th>
                                                Estudiante
                                            </th>

                                            <th>
                                                Curso
                                            </th>

                                            <th>
                                                Acudiente
                                            </th>

                                            <th>
                                                Fecha
                                            </th>

                                            <th>
                                                Motivo
                                            </th>

                                            <th>
                                                Estado
                                            </th>

                                            <th>
                                                Acciones
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {excusas.map(
                                            (excusa) => (

                                                <tr
                                                    key={
                                                        excusa.id_excusa
                                                    }
                                                >

                                                    <td>

                                                        {excusa.estudiante ||
                                                            "Sin nombre"}

                                                    </td>


                                                    <td>

                                                        {excusa.curso ||
                                                            "Sin curso"}

                                                    </td>


                                                    <td>

                                                        {excusa.acudiente ||
                                                            "Sin acudiente"}

                                                    </td>


                                                    <td>

                                                        {excusa.fecha ||
                                                            "Sin fecha"}

                                                    </td>


                                                    <td>

                                                        {excusa.motivo ||
                                                            "Sin motivo"}

                                                    </td>


                                                    <td>

                                                        {obtenerBadgeEstado(
                                                            excusa.estado
                                                        )}

                                                    </td>


                                                    <td>

                                                        {excusa.estado ===
                                                            "Pendiente" && (

                                                            <div className="d-flex gap-2">

                                                                <button
                                                                    type="button"
                                                                    className="btn btn-success btn-sm"
                                                                    onClick={() =>
                                                                        aprobar(
                                                                            excusa.id_excusa
                                                                        )
                                                                    }
                                                                >

                                                                    Aprobar

                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    className="btn btn-danger btn-sm"
                                                                    onClick={() =>
                                                                        rechazar(
                                                                            excusa.id_excusa
                                                                        )
                                                                    }
                                                                >

                                                                    Rechazar

                                                                </button>

                                                            </div>

                                                        )}

                                                        {excusa.estado ===
                                                            "Aprobada" && (

                                                            <span className="text-success">
                                                                Excusa aprobada
                                                            </span>

                                                        )}

                                                        {excusa.estado ===
                                                            "Rechazada" && (

                                                            <span className="text-danger">
                                                                Excusa rechazada
                                                            </span>

                                                        )}

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                </div>

            </div>

        </Layout>
    );
}


export default GestionExcusas;