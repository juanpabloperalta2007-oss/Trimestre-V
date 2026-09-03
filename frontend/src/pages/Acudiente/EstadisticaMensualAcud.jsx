import { useState, useEffect } from "react";
import Header from "../../components/Header";
import SidebarAcud from "../../components/SidebarAcud";
import Footer from "../../components/Footer";

export default function EstadisticaMensual() {
    const [mesSeleccionado, setMesSeleccionado] = useState("marzo");
    const [nombreEstudiante, setNombreEstudiante] = useState("Juan Camilo Rosas Cortes");

    // Datos simulados para actualizar los paneles según el mes seleccionado
    const dataPorMes = {
        febrero: { asistencias: 20, fallas: 1, justificadas: 0, retardos: 2 },
        marzo:   { asistencias: 25, fallas: 2, justificadas: 1, retardos: 5 },
        abril:   { asistencias: 18, fallas: 0, justificadas: 3, retardos: 1 },
        mayo:    { asistencias: 22, fallas: 4, justificadas: 2, retardos: 0 }
    };

    // Al cargar la vista, recuperamos el nombre guardado por la vista de consulta si existe
    useEffect(() => {
        const nombreGuardado = localStorage.getItem('estudianteSeleccionadoNombre');
        if (nombreGuardado) {
            setNombreEstudiante(nombreGuardado);
        }
    }, []);

    const datosActuales = dataPorMes[mesSeleccionado] || dataPorMes.marzo;

    return (
        <div className="app-layout">
            <Header />
            <div className="app-body d-flex">
                <SidebarAcud />
                
                <main className="container-fluid py-4 flex-grow-1">
                    <div className="mb-4">
                        <h2 className="text-dark">Estadística Mensual de Asistencia</h2>
                        <p className="text-muted small">
                            Mostrando reporte para: <strong className="text-primary">{nombreEstudiante}</strong>
                        </p>
                    </div>

                    {/* Filtro de Meses */}
                    <div className="d-flex align-items-center gap-2 mb-4">
                        <label className="fw-bold text-secondary">Mes:</label>
                        <select 
                            className="form-select style-select" 
                            value={mesSeleccionado}
                            onChange={(e) => setMesSeleccionado(e.target.value)}
                            style={{ maxWidth: "200px" }}
                        >
                            <option value="febrero">Febrero</option>
                            <option value="marzo">Marzo</option>
                            <option value="abril">Abril</option>
                            <option value="mayo">Mayo</option>
                        </select>
                    </div>

                    {/* Grid de Reportes Numéricos */}
                    <div className="row row-cols-1 row-cols-md-4 g-3">
                        <div className="col">
                            <div className="card p-3 border-left-success shadow-sm">
                                <span className="text-muted small fw-medium">Asistencias</span>
                                <div className="fs-2 fw-bold text-dark">{datosActuales.asistencias}</div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="card p-3 border-left-danger shadow-sm">
                                <span className="text-muted small fw-medium">Fallas sin justificar</span>
                                <div className="fs-2 fw-bold text-dark">{datosActuales.fallas}</div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="card p-3 border-left-info shadow-sm">
                                <span className="text-muted small fw-medium">Fallas justificadas</span>
                                <div className="fs-2 fw-bold text-dark">{datosActuales.justificadas}</div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="card p-3 border-left-warning shadow-sm">
                                <span className="text-muted small fw-medium">Retardos</span>
                                <div className="fs-2 fw-bold text-dark">{datosActuales.retardos}</div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}