import Layout from "../../components/Layout";
import NotificacionesTable from "../../components/NotificacionesTable";

function Notificaciones() {

  return (

    <Layout titulo="Notificaciones por Correo">

      <div className="alert alert-info">

        <i className="bi bi-info-circle me-2"></i>

        Aquí se muestran las notificaciones automáticas enviadas a los acudientes.

      </div>

      <NotificacionesTable />

    </Layout>

  );

}

export default Notificaciones;