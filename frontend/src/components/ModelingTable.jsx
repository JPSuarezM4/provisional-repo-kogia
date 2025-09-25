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

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Datasets enviados a modelado</Typography>
      {datasets.map(ds => (
        <Box key={ds.id} sx={{ mb: 4 }}>
          <Typography variant="h6">{ds.nombre}</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>{ds.descripcion}</Typography>
          <TableContainer component={Paper} sx={{ maxWidth: 400 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><b>Fecha</b></TableCell>
                  <TableCell><b>Valor</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(Array.isArray(ds.datos)
                  ? ds.datos.flatMap(d =>
                      Array.isArray(d.data)
                        ? d.data.slice(0, 5)
                        : []
                    )
                  : []
                ).map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row?.date ?? ""}</TableCell>
                    <TableCell>{row?.value ?? ""}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Box>
  );
}

export default ModelingTable;