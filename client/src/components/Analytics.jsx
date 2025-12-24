import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import '../styles/Analytics.css';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const Analytics = ({ data, selectedLocations, onLocationChange, availableLocations }) => {
  const { totalAmount, locationWise, categoryWise, monthlyData } = data;

  // Pie Chart - Location-wise
  const pieData = {
    labels: Object.keys(locationWise),
    datasets: [{
      data: Object.values(locationWise),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#FF6384',
        '#C9CBCF'
      ],
      borderWidth: 2,
      borderColor: 'var(--border-color)'
    }]
  };

  // Bar Chart - Category-wise
  const barData = {
    labels: Object.keys(categoryWise),
    datasets: [{
      label: 'Amount',
      data: Object.values(categoryWise),
      backgroundColor: '#36A2EB',
      borderColor: '#36A2EB',
      borderWidth: 1
    }]
  };

  // Line Chart - Monthly totals
  const months = Object.keys(monthlyData).sort();
  const monthlyTotals = months.map(month => 
    Object.values(monthlyData[month]).reduce((sum, val) => sum + val, 0)
  );

  const lineData = {
    labels: months,
    datasets: [{
      label: 'Total Amount',
      data: monthlyTotals,
      borderColor: '#4BC0C0',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.4,
      fill: true
    }]
  };

  // Stacked Bar Chart - Monthly by category
  const categories = [...new Set(Object.values(monthlyData).flatMap(m => Object.keys(m)))];
  const stackedBarData = {
    labels: months,
    datasets: categories.map((category, idx) => ({
      label: category,
      data: months.map(month => monthlyData[month][category] || 0),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40'
      ][idx % 6],
    }))
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim(),
          font: { size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.label}: ₹${context.parsed.y || context.parsed}`;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: { 
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim() 
        },
        grid: { 
          color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() 
        }
      },
      x: {
        ticks: { 
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim() 
        },
        grid: { 
          color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() 
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim(),
          font: { size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.label}: ₹${context.parsed}`;
          }
        }
      }
    }
  };

  const stackedOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      x: { ...chartOptions.scales.x, stacked: true },
      y: { ...chartOptions.scales.y, stacked: true }
    }
  };

  const handleLocationToggle = (location) => {
    if (selectedLocations.includes(location)) {
      onLocationChange(selectedLocations.filter(l => l !== location));
    } else {
      onLocationChange([...selectedLocations, location]);
    }
  };

  const handleSelectAll = () => {
    onLocationChange(availableLocations);
  };

  const handleClearAll = () => {
    onLocationChange([]);
  };

  return (
    <div className="analytics-section">
      <div className="analytics-header">
        <h2>Analytics</h2>
        <div className="total-amount">
          Total: <span>₹{totalAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="location-filters">
        <div className="filter-buttons">
          {availableLocations.map(location => (
            <button
              key={location}
              className={`filter-btn ${selectedLocations.includes(location) ? 'active' : ''}`}
              onClick={() => handleLocationToggle(location)}
            >
              {location}
            </button>
          ))}
        </div>
        <div className="filter-actions">
          <button onClick={handleSelectAll} className="action-btn">Select All</button>
          <button onClick={handleClearAll} className="action-btn">Clear All</button>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Expense by Location</h3>
          <div className="chart-wrapper">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>

        <div className="chart-container">
          <h3>Expense by Category</h3>
          <div className="chart-wrapper">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container full-width">
          <h3>Monthly Total Amount</h3>
          <div className="chart-wrapper">
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container full-width">
          <h3>Last 3 Months - Category Breakdown</h3>
          <div className="chart-wrapper">
            <Bar data={stackedBarData} options={stackedOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
