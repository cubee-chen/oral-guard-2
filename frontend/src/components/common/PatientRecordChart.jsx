// src/components/common/PatientRecordChart.jsx
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import '../../styles/components/PatientRecordChart.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PatientRecordChart = ({ recordData }) => {
  if (!recordData || !recordData.dates || recordData.dates.length === 0) {
    return (
      <div className="chart-container empty-chart">
        <p>No record data available yet.</p>
      </div>
    );
  }

  // Format dates for display
  const formattedDates = recordData.dates.map(date => 
    new Date(date).toLocaleDateString()
  );

  const data = {
    labels: formattedDates,
    datasets: [
      {
        label: 'Plaque Coverage (%)',
        data: recordData.plaqueCoverage,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      },
      {
        label: 'Gingival Inflammation',
        data: recordData.gingivalInflammation,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4
      },
      {
        label: 'Tartar',
        data: recordData.tartar,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Oral Health Metrics Over Time',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += parseFloat(context.parsed.y).toFixed(2);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Value'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <Line data={data} options={options} />
    </div>
  );
};

export default PatientRecordChart;