import { useEffect, useState } from "react";
import { obtenerReportes } from "../services/api";

function ReportesChart() {

    const [reportes, setReportes] = useState([]);

    useEffect(() => {
        cargarDatos();
    }, []);

    async function cargarDatos() {

        try {

            const datos = await obtenerReportes();

            setReportes(datos);

        } catch (error) {

            console.error(error);

        }

    }

    return (

        <div className="card shadow">

            <div className="card-header bg-success text-white">

                <h5 className="mb-0">

                    <i className="bi bi-bar-chart-line-fill me-2"></i>

                    Porcentaje de asistencia

                </h5>

            </div>

            <div className="card-body">

                {reportes.map((r) => (

                    <div key={r.id} className="mb-4">

                        <div className="d-flex justify-content-between">

                            <strong>

                                {r.curso} - {r.mes}

                            </strong>

                            <strong>

                                {r.porcentaje}%

                            </strong>

                        </div>

                        <div className="progress" style={{height:"28px"}}>

                            <div
                                className="progress-bar bg-success"
                                style={{width:`${r.porcentaje}%`}}
                            >

                                {r.porcentaje}%

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default ReportesChart;