import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout({ titulo, children }) {

    return (

        <div className="bg-light min-vh-100">

            <Navbar />

            <div className="container-fluid">

                <div className="row">

                    <Sidebar />

                    <div className="col-md-9 col-lg-10 p-4">

                        <h2 className="fw-bold mb-4">

                            {titulo}

                        </h2>

                        {children}

                    </div>

                </div>

            </div>

        </div>

    )

}

export default Layout;