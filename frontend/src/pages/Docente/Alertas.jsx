import Layout from "../../components/Layout";
import AlertasTable from "../../components/AlertasTable";

function Alertas() {

  return (

    <Layout titulo="Alertas de Inasistencia">

      <div className="row mb-4">

        <div className="col-md-4">

          <div className="card border-primary shadow-sm">

            <div className="card-body text-center">

              <i className="bi bi-bell-fill text-primary fs-1"></i>

              <h3 className="mt-3">3</h3>

              <p className="mb-0 fw-bold">
                Total Alertas
              </p>

            </div>

          </div>

        </div>

        <div className="col-md-4">

          <div className="card border-warning shadow-sm">

            <div className="card-body text-center">

              <i className="bi bi-exclamation-circle-fill text-warning fs-1"></i>

              <h3 className="mt-3">2</h3>

              <p className="mb-0 fw-bold">
                Exceso de Inasistencias
              </p>

            </div>

          </div>

        </div>

        <div className="col-md-4">

          <div className="card border-danger shadow-sm">

            <div className="card-body text-center">

              <i className="bi bi-x-circle-fill text-danger fs-1"></i>

              <h3 className="mt-3">1</h3>

              <p className="mb-0 fw-bold">
                Pérdida de Materia
              </p>

            </div>

          </div>

        </div>

      </div>

      <AlertasTable />

    </Layout>

  );

}

export default Alertas;