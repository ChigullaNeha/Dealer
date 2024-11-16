import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="not-found-container">
      <h1 className="not-found-text">Page Not Found</h1>
      <button className="not-found-button" onClick={() => navigate('/')}>
        Go to Homepage
      </button>
    </div>
  );
};

export default NotFound;
