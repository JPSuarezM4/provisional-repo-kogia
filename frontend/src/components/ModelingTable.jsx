import { useEffect, useState } from "react";
import {
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, Typography, Box, IconButton, Tooltip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

function ModelingTable() {
  const [datasets, setDatasets] = useState([]);

  // Cargar datasets
  const fetchDatasets = () => {
    fetch("https://modelingservice-production.up.railway.app/api/modeling-datasets")
      .then(res => res.json())
      .then(data => setDatasets(data));
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  // Eliminar dataset por id
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este dataset?")) return;
    await fetch(`https://modelingservice-production.up.railway.app/api/modeling-datasets/${id}`, {
      method: "DELETE",
    });
    fetchDatasets();
  };

  if (!datasets.length) return <Typography>No hay datasets exportados.</Typography>;

  // Construir encabezado: dos columnas por cada gráfico en cada dataset
  const header = [];
  datasets.forEach(ds => {
    if (Array.isArray(ds.datos)) {
      ds.datos.forEach((grafico, idx) => {
        header.push(
          { label: `${ds.nombre} (${grafico.tipoProcesamiento}) - Fecha`, id: `${ds.id}-${idx}-fecha` },
          { label: `${ds.nombre} (${grafico.tipoProcesamiento}) - Valor`, id: `${ds.id}-${idx}-valor` }
        );
      });
    }
  });

  // Construir filas (solo los primeros 5)
  const rows = [];
  for (let i = 0; i < 5; i++) {
    let row = [];
    datasets.forEach(ds => {
      if (Array.isArray(ds.datos)) {
        ds.datos.forEach(grafico => {
          const item = grafico.data[i];
          row.push(item ? item.date : "", item ? item.value : "");
        });
      }
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
                <TableCell key={idx} align="center">
                  <Box display="flex" alignItems="center" justifyContent="center">
                    <span>{h.label}</span>
                    {/* Solo muestra el botón en la columna "Valor" para evitar duplicados */}
                    {idx % 2 === 1 && (
                      <Tooltip title="Eliminar dataset">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(h.id)}
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
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