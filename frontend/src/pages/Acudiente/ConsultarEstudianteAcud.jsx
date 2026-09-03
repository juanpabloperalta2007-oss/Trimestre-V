import { useState, useEffect } from "react";
import Header from "../../components/Header";
import SidebarAcud from "../../components/SidebarAcud";
import Footer from "../../components/Footer";

export default function ConsultarEstudiantes() {
    
    // Función adaptada para el manejo de clics en React
    const seleccionarEstudiante = (id, nombre) => {
        console.log(`Estudiante seleccionado ID: ${id} - ${nombre}`);
        // Guardamos en el localStorage igual que antes
        localStorage.setItem('estudianteSeleccionadoId', id);
        localStorage.setItem('estudianteSeleccionadoNombre', nombre);
        
        alert(`Cargando el perfil de: ${nombre}`);
        // Aquí usarías tu enrutador si es necesario (ej: navigate('/estadistica'))
    };

    return (
        <div className="app-layout">
            <Header />
            <div className="app-body d-flex">
                <SidebarAcud />
                
                {/* Contenido Principal de la Vista */}
                <main className="container-fluid py-4 flex-grow-1">
                    <div className="mb-4">
                        <h2 className="text-dark">Consultar Estudiantes</h2>
                        <p className="text-muted small">Seleccione el estudiante para ver el reporte detallado.</p>
                    </div>
                    
                    <div className="row gap-3">
                        {/* Tarjeta Estudiante 1 */}
                        <div 
                            className="card p-4 text-center cursor-pointer style-card" 
                            onClick={() => seleccionarEstudiante(1, 'Juan Camilo Rosas')}
                        >
                            <div className="avatar-circle mb-3">JC</div>
                            <h5 className="card-title text-secondary">Juan Camilo<br/>Rosas Cortes</h5>
                            <span className="badge bg-primary mt-2">Curso 10A</span>
                        </div>

                        {/* Tarjeta Estudiante 2 */}
                        <div 
                            className="card p-4 text-center cursor-pointer style-card" 
                            onClick={() => seleccionarEstudiante(2, 'Daniel Santiago Rosas')}
                        >
                            <div className="avatar-circle mb-3">DR</div>
                            <h5 className="card-title text-secondary">Daniel Santiago<br/>Rosas Cortes</h5>
                            <span className="badge bg-primary mt-2">Curso 11B</span>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}