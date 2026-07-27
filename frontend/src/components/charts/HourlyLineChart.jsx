import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const HourlyLineChart = ({ data = [] }) => {
  const labels = data.map(item => item.hour);
  const electricity = data.map(item => item.electricity_kwh);
  const hvac = data.map(item => item.hvac_kwh);
  const lighting = data.map(item => item.lighting_kwh);
  const solar = data.map(item => item.solar_kwh);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Total Electricity (kWh)',
        data: electricity,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5
      },
      {
        label: 'HVAC Load (kWh)',
        data: hvac,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        tension: 0.4,
        fill: false,
        borderWidth: 2,
        borderDash: [4, 4],
        pointRadius: 0
      },
      {
        label: 'Lighting (kWh)',
        data: lighting,
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        tension: 0.4,
        fill: false,
        borderWidth: 1.5,
        pointRadius: 0
      },
      {
        label: 'Solar Gen (kWh)',
        data: solar,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 1.5,
        pointRadius: 0
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { size: 11, family: 'Inter' },
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', font: { size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', font: { size: 10 } }
      }
    }
  };

  return (
    <div className="w-full h-72">
      <Line data={chartData} options={options} />
    </div>
  );
};
