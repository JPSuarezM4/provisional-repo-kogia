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

  // Construir filas (solo los primeros 5)
  const rows = [];
  for (let i = 0; i < 5; i++) {
    let row = [];
    datasets.forEach(ds => {
      let item = null;
      if (Array.isArray(ds.datos)) {
        for (const d of ds.datos) {
          if (Array.isArray(d.data) && d.data[i]) {
            item = d.data[i];
            break;
          }
        }
      }
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
            {rows.map((row, idx) => (
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