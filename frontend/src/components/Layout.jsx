function Layout({ titulo, children }) {
  return (
    <div className="bg-light min-vh-100">

      <div className="bg-primary text-white p-3">
        <h5 className="mb-0">
          Liceo Antonio de Toledo - GAE
        </h5>
      </div>

      <div className="container-fluid">

        <div className="row">

          <div className="col-12 p-4">

            <h2 className="fw-bold mb-4">
              {titulo}
            </h2>

            {children}

          </div>

        </div>

      </div>

    </div>
  );
}

export default Layout;