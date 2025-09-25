import { useEffect, useState } from "react";
import {
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, Typography, Box
} from "@mui/material";

function ModelingTable() {
  const [datasets, setDatasets] = useState([]);

  useEffect(() => {
    fetch("https://modelingservice-production.up.railway.app/api/modeling-datasets")
      .then(res => res.json())
      .then(data => setDatasets(data));
  }, []);

  if (!datasets.length) return <Typography>No hay datasets exportados.</Typography>;

  // Construir encabezado: dos columnas por dataset
  const header = datasets.flatMap(ds => [
    `${ds.nombre} - Fecha`,
    `${ds.nombre} - Valor`
  ]);

  // Encontrar el máximo de filas entre todos los datasets
  const maxRows = Math.max(
    ...datasets.map(ds =>
      Array.isArray(ds.datos)
        ? ds.datos.flatMap(d => Array.isArray(d.data) ? d.data.length : 0)
        : 0
    )
  );

  // Construir filas
  const rows = [];
  for (let i = 0; i < maxRows; i++) {
    let row = [];
    datasets.forEach(ds => {
      // Tomar los primeros 5 datos de cada dataset (puedes cambiar a más si quieres)
      const flatData = Array.isArray(ds.datos)
        ? ds.datos.flatMap(d => Array.isArray(d.data) ? d.data : [])
        : [];
      const item = flatData[i];
      row.push(item ? item.date : "", item ? item.value : "");
    });
    rows.push(row);
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Datasets enviados a modelado</Typography>
      <TableContainer component={Paper} sx={{ maxWidth: 1200 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {header.map((h, idx) => (
                <TableCell key={idx}><b>{h}</b></TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(0, 5).map((row, idx) => (
              <TableRow key={idx}>
                {row.map((cell, i) => (
                  <TableCell key={i}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ModelingTable;