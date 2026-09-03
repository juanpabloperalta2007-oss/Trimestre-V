import React from 'react';

function BuzonCard() {
  // Simulación de los datos del buzón
  const mensajes = [
    { id: 1, nombre: "Daniel Felipe Castellanos Díaz", fecha: "Ayer", rol: "Coordinador" },
    { id: 2, nombre: "Daniel Felipe Castellanos Díaz", fecha: "Ayer", rol: "Coordinador" },
    { id: 3, nombre: "Daniel Felipe Castellanos Díaz", fecha: "Ayer", rol: "Coordinador" }
  ];

  function verMensajes() {
    alert("Mostrando todos los mensajes");
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
        <h5 className="card-title fw-semibold text-secondary m-0">
          <i className="bi bi-mailbox me-2 text-primary"></i> Buzón - No leídos
        </h5>
        <span className="badge bg-danger rounded-pill">{mensajes.length} nuevos</span>
      </div>
      
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover table-striped align-middle mb-0">
            <thead className="table-light text-secondary">
              <tr>
                <th className="ps-4">Nombre</th>
                <th>Fecha</th>
                <th className="pe-4">Rol</th>
              </tr>
            </thead>
            <tbody>
              {mensajes.map(function(msg) {
                return (
                  <tr key={msg.id}>
                    <td className="ps-4 fw-medium text-dark">{msg.nombre}</td>
                    <td><span className="text-muted">{msg.fecha}</span></td>
                    <td className="pe-4">
                      <span className="badge bg-light text-dark border">{msg.rol}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="card-footer bg-white text-end py-3 border-top">
        <button className="btn btn-primary btn-sm px-4" onClick={verMensajes}>
          Ver todo <i className="bi bi-arrow-right ms-1"></i>
        </button>
      </div>
    </div>
  );
}

export default BuzonCard;