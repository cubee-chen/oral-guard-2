// src/components/facility/HygieneStatsChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import '../../styles/components/HygieneStatsChart.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const HygieneStatsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container empty-chart">
        <p>No data available to display.</p>
      </div>
    );
  }

  // Determine bar colors based on score
  const getBarColors = (scores) => {
    return scores.map(score => {
      if (score >= 80) return 'rgba(72, 187, 120, 0.7)'; // Good - green
      if (score >= 60) return 'rgba(237, 137, 54, 0.7)'; // Moderate - orange
      return 'rgba(229, 62, 62, 0.7)'; // Poor - red
    });
  };

  const chartData = {
    labels: data.map(item => item.patientName),
    datasets: [
      {
        label: 'Oral Hygiene Score',
        data: data.map(item => item.hygieneScore),
        backgroundColor: getBarColors(data.map(item => item.hygieneScore)),
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 30,
        maxBarThickness: 40
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Patient Oral Hygiene Scores',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + '/100';
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
          text: 'Score',
          font: {
            weight: 'bold'
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Patient',
          font: {
            weight: 'bold'
          }
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <Bar data={chartData} options={options} height={300} />
    </div>
  );
};