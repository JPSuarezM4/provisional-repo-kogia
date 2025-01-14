import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const NodosContext = createContext();

export const NodosProvider = ({ children }) => {
  const [nodos, setNodos] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga

  const fetchNodos = async () => {
    setLoading(true); // Iniciar la carga
    try {
      const response = await fetch('http://127.0.0.1:5000/api/nodos');
      if (!response.ok) throw new Error('Error al obtener los nodos');
      const data = await response.json();
      setNodos(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false); // Finalizar la carga
    }
  };
  
  NodosProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  useEffect(() => {
    fetchNodos();
  }, []);

  const addNodo = (nodo) => {
    setNodos((prevNodos) => [...prevNodos, nodo]);
  };

  return (
    <NodosContext.Provider value={{ nodos, fetchNodos, addNodo, loading }}>
      {children}
    </NodosContext.Provider>
  );
};