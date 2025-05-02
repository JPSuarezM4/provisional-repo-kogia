import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token'); // Verifica si el token está almacenado
    return token ? children : <Navigate to="/login" />;
};
ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
