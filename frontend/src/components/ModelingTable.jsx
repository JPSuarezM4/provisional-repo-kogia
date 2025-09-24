import { useEffect, useState } from "react";

function ModelingTable() {
  const [datasets, setDatasets] = useState([]);

  useEffect(() => {
    fetch("https://modelingservice-production.up.railway.app/api/modeling-datasets")
      .then(res => res.json())
      .then(data => setDatasets(data));
  }, []);

  if (!datasets.length) return <div>No hay datasets exportados.</div>;

  return (
    <div>
      <h2>Datasets enviados a modelado</h2>
      {datasets.map(ds => (
        <div key={ds.id} style={{ marginBottom: "2rem" }}>
          <h4>{ds.nombre}</h4>
          <p>{ds.descripcion}</p>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(ds.datos)
                ? ds.datos.flatMap(d =>
                    Array.isArray(d.data)
                      ? d.data.slice(0, 5)
                      : []
                  )
                : []
              ).map((row, idx) => (
                <tr key={idx}>
                  <td>{row?.date ?? ""}</td>
                  <td>{row?.value ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default ModelingTable;