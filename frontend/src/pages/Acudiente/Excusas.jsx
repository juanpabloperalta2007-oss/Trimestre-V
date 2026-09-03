import Layout from "../../components/Layout";
import ExcusasTable from "../../components/ExcusasTable";

function Excusas() {
  return (
    <Layout titulo="Gestión de Excusas">

      <div className="alert alert-warning">
        <i className="bi bi-file-earmark-text me-2"></i>
        Revise y gestione las excusas de inasistencia presentadas por los estudiantes.
      </div>

      <ExcusasTable />

    </Layout>
  );
}

export default Excusas;