import Layout from "../../components/Layout";
import ReportesTable from "../../components/ReportesTable";

function Reportes() {

  return (

    <Layout titulo="Reporte Mensual de Asistencia">

      <div className="alert alert-info">

        El docente puede consultar el comportamiento mensual de asistencia.

      </div>

      <ReportesTable />

    </Layout>

  );

}

export default Reportes;