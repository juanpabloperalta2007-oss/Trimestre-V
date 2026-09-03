import Layout from "../../components/Layout";
import CursosTable from "../../components/CursosTable";

function Cursos() {

  return (

    <Layout titulo="Consultar Cursos">

      <div className="alert alert-info">

        El coordinador puede acceder a cualquier curso y eliminar inasistencias injustificadas.

      </div>

      <CursosTable />

    </Layout>

  );

}

export default Cursos;