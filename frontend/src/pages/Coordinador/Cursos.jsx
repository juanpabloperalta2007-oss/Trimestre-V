import Layout from "../../components/Layout";
import CursosTable from "../../components/CursosTable";

function Cursos() {
  return (
    <Layout titulo="Consultar Cursos">
      <div className="alert alert-info shadow-sm mb-4">
        <i className="bi bi-info-circle-fill me-2"></i>
        Desde este módulo, el coordinador puede crear cursos, asignar directores de grupo, consultar los estudiantes matriculados y revisar las inasistencias registradas.
      </div>

      <CursosTable />
    </Layout>
  );
}

export default Cursos;