import { useState } from "react";
import axios from "axios";

function VincularEstudiante({ idUsuarioActual, onVinculacionExitosa }) {
  const [documento, setDocumento] = useState("");
  const [parentesco, setParentesco] = useState("Padre/Madre");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/acudientes/vincular-estudiante", {
        id_usuario: idUsuarioActual,
        documento_estudiante: documento,
        parentesco: parentesco
      });

      setMensaje(`¡Éxito! Se vinculó a ${res.data.estudiante}`);
      setDocumento("");
      if (onVinculacionExitosa) onVinculacionExitosa(); // Recarga la lista de estudiantes acudidos
    } catch (err) {
      setError(err.response?.data?.error || "Ocurrió un error al vincular");
    }
  };

  return (
    <div className="card p-3 my-3">
      <h4>Vincular un Estudiante</h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label className="form-label">Número de documento del estudiante:</label>
          <input
            type="text"
            className="form-control"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            placeholder="Ej: 1012345678"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Parentesco:</label>
          <select 
            className="form-select"
            value={parentesco} 
            onChange={(e) => setParentesco(e.target.value)}
          >
            <option value="Padre/Madre">Padre/Madre</option>
            <option value="Acudiente Legal">Acudiente Legal</option>
            <option value="Familiar">Familiar</option>
          </select>
        </div>

        <button type="submit" className="btn btn-success">
          Vincular Estudiante
        </button>
      </form>

      {mensaje && <p className="text-success mt-2">{mensaje}</p>}
      {error && <p className="text-danger mt-2">{error}</p>}
    </div>
  );
}

export default VincularEstudiante;