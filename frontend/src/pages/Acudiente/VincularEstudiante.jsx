import React, { useState } from "react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function VincularEstudiante({ idUsuarioActual, onVinculacionExitosa }) {
  const { usuario } = useAuth();
  const [documento, setDocumento] = useState("");
  const [parentesco, setParentesco] = useState("Padre/Madre");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const obtenerIdUsuario = () => {
    if (idUsuarioActual) return idUsuarioActual;
    if (usuario?.id_usuario || usuario?.id) return usuario.id_usuario || usuario.id;

    try {
      const guardado = JSON.parse(localStorage.getItem("usuario") || "{}");
      return guardado.id_usuario || guardado.id || null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    const idUsuario = obtenerIdUsuario();
    const docLimpio = documento.trim();

    if (!idUsuario) {
      setError("No se pudo identificar la sesión del acudiente.");
      return;
    }

    if (docLimpio.length < 6) {
      setError("Ingresa un número de documento válido.");
      return;
    }

    try {
      setEnviando(true);
      const res = await API.post("/acudientes_estudiantes/vincular", {
        id_usuario: idUsuario,
        documento_estudiante: docLimpio,
        parentesco,
      });

      const nombreEst =
        res.data?.estudiante ||
        res.data?.nombre_estudiante ||
        "el estudiante";

      setMensaje(`¡Éxito! Se vinculó a ${nombreEst}.`);
      setDocumento("");

      if (onVinculacionExitosa) {
        onVinculacionExitosa(res.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Ocurrió un error al vincular el estudiante."
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="card p-3 my-3 shadow-sm border-0">
      <h5 className="fw-bold mb-3">Vincular un Estudiante</h5>
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label className="form-label small fw-bold">
            Número de documento del estudiante:
          </label>
          <input
            type="text"
            inputMode="numeric"
            className="form-control"
            value={documento}
            onChange={(e) => setDocumento(e.target.value.replace(/\D/g, ""))}
            placeholder="Ej: 1500286477"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label small fw-bold">Parentesco:</label>
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

        <button
          type="submit"
          className="btn btn-success fw-bold"
          disabled={enviando}
        >
          {enviando ? "Vinculando..." : "Vincular Estudiante"}
        </button>
      </form>

      {mensaje && (
        <div className="alert alert-success mt-3 py-2 small mb-0">{mensaje}</div>
      )}
      {error && (
        <div className="alert alert-danger mt-3 py-2 small mb-0">{error}</div>
      )}
    </div>
  );
}

export default VincularEstudiante;