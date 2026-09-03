import { useState, useEffect } from "react";
import Header from "../../components/Header";
import SidebarAcud from "../../components/SidebarAcud";
import Footer from "../../components/Footer";

export default function GenerarExcusaAcud() {

    const [estudiante, setEstudiante] = useState("Juan Camilo Rosas Cortes");
    const [motivo, setMotivo] = useState("");
    const [fecha, setFecha] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [soporte, setSoporte] = useState(null);

    useEffect(() => {
        const nombreGuardado = localStorage.getItem("estudianteSeleccionadoNombre");

        if (nombreGuardado) {
            setEstudiante(nombreGuardado);
        }
    }, []);

    const procesarEnvioExcusa = (event) => {
        event.preventDefault();

        const datosExcusa = {
            estudiante,
            motivo,
            fecha,
            descripcion,
            soporteCargado: soporte ? soporte.name : "Ninguno",
        };

        console.log("Datos listos para enviar al backend:", datosExcusa);

        alert(
            `¡Éxito! La excusa para ${datosExcusa.estudiante} ha sido radicada correctamente bajo el motivo: ${datosExcusa.motivo}.`
        );

        setMotivo("");
        setFecha("");
        setDescripcion("");
        setSoporte(null);
    };

    return (
        <div className="app-layout">
            <Header />

            <div className="app-body d-flex">

                {/* Menú del acudiente */}
                <SidebarAcud />

                <main className="container-fluid py-4 flex-grow-1">

                    <div className="mb-4">
                        <h2 className="text-dark">Generar Excusa</h2>
                    </div>

                    <div
                        className="card p-4 shadow-sm"
                        style={{ maxWidth: "600px" }}
                    >
                        <form onSubmit={procesarEnvioExcusa}>

                            <div className="mb-3">
                                <label className="form-label fw-bold">
                                    Estudiante asociado
                                </label>

                                <input
                                    type="text"
                                    className="form-control bg-light"
                                    value={estudiante}
                                    readOnly
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">
                                    Motivo / Tipo de novedad
                                </label>

                                <select
                                    className="form-select"
                                    value={motivo}
                                    onChange={(e) => setMotivo(e.target.value)}
                                    required
                                >
                                    <option value="">-- Seleccione un motivo --</option>
                                    <option value="Incapacidad Médica">
                                        Incapacidad / Cita Médica
                                    </option>
                                    <option value="Calamidad Doméstica">
                                        Calamidad Doméstica
                                    </option>
                                    <option value="Otra">
                                        Otra
                                    </option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">
                                    Fecha de la inasistencia
                                </label>

                                <input
                                    type="date"
                                    className="form-control"
                                    value={fecha}
                                    onChange={(e) => setFecha(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">
                                    Descripción detallada
                                </label>

                                <textarea
                                    className="form-control"
                                    rows="4"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    placeholder="Escriba el motivo aquí..."
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-bold">
                                    Adjuntar soporte (Opcional)
                                </label>

                                <input
                                    type="file"
                                    className="form-control"
                                    onChange={(e) => setSoporte(e.target.files[0])}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary fw-bold"
                            >
                                Radicar Excusa
                            </button>

                        </form>
                    </div>

                </main>

            </div>

            <Footer />
        </div>
    );
}