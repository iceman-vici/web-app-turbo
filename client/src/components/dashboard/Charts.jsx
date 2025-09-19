import React, { useEffect, useRef } from 'react';
import Card from '../common/Card';
import './Charts.css';

const Charts = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Simple chart drawing with canvas
    if (chartRef.current) {
      const canvas = chartRef.current;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Sample data
      const data = [30, 50, 45, 60, 70, 65, 80, 75, 90, 85, 95, 100];
      const maxValue = Math.max(...data);
      const padding = 40;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;

      // Draw grid
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;

      // Horizontal grid lines
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }

      // Draw line chart
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 2;
      ctx.beginPath();

      data.forEach((value, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - (value / maxValue) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw points
      ctx.fillStyle = '#4f46e5';
      data.forEach((value, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - (value / maxValue) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, []);

  return (
    <Card title="Performance Overview" className="chart-card">
      <div className="chart-container">
        <canvas 
          ref={chartRef} 
          width="600" 
          height="300"
          className="chart-canvas"
        />
      </div>
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#4f46e5' }}></span>
          <span>Revenue</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
          <span>Users</span>
        </div>
      </div>
    </Card>
  );
};

export default Charts;