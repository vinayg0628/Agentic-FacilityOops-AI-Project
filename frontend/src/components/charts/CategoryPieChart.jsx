import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export const CategoryPieChart = ({ data = [] }) => {
  const labels = data.map(item => item.category);
  const values = data.map(item => item.kwh);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          'rgba(6, 182, 212, 0.85)',   // HVAC (Cyan)
          'rgba(16, 185, 129, 0.85)',  // Lighting (Emerald)
          'rgba(59, 130, 246, 0.85)',  // Equipment (Blue)
          'rgba(245, 158, 11, 0.85)'   // Solar (Amber)
        ],
        borderColor: '#0f172a',
        borderWidth: 2,
        hoverOffset: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#94a3b8',
          font: { size: 11 },
          padding: 14,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: '#334155',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            return ` ${context.label}: ${val.toLocaleString()} kWh`;
          }
        }
      }
    },
    cutout: '68%'
  };

  return (
    <div className="w-full h-72 flex items-center justify-center">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};
