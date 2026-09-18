import React from "react";

import Layout from "../../components/Layout";

import ExcusasTable from "../../components/ExcusasTable";


function GestionExcusasCoord() {

    return (

        <Layout titulo="Gestión de Excusas">

            <div className="container-fluid px-0">


                <div className="mb-4">

                    <h5 className="fw-bold mb-1">

                        Administración de excusas

                    </h5>

                    <p className="text-muted mb-0">

                        Revisa y gestiona las excusas
                        presentadas por los estudiantes.

                    </p>

                </div>


                <div className="alert alert-info d-flex align-items-center mb-4">

                    <i className="bi bi-info-circle-fill me-2"></i>

                    <div>

                        El coordinador puede revisar
                        las excusas registradas y
                        gestionar su estado.

                    </div>

                </div>


                <ExcusasTable />

            </div>

        </Layout>
    );
}


export default GestionExcusasCoord;