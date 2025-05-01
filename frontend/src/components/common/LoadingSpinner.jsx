// src/components/common/LoadingSpinner.jsx
import '../../styles/components/LoadingSpinner.css';

const LoadingSpinner = ({ overlay }) => {
  return (
    <div className={`spinner-container ${overlay ? 'overlay' : ''}`}>
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingSpinner;