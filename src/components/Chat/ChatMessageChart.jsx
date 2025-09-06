import React, { useRef } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

// Registramos todos los componentes que Chart.js necesita
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Map global para trackear qué gráficos ya se han animado
const animatedCharts = new Map();

// Función para generar un hash simple del contenido del gráfico
const generateChartId = (chartData) => {
  const content = JSON.stringify({
    type: chartData.type,
    labels: chartData.data?.labels,
    datasets: chartData.data?.datasets?.map(ds => ({
      label: ds.label,
      data: ds.data
    }))
  });
  
  // Hash simple
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a 32bit integer
  }
  return `chart-${Math.abs(hash)}`;
};

const ChatMessageChart = ({ chartData }) => {
  const chartRef = useRef(null);
  
  if (!chartData || !chartData.type || !chartData.data) {
      console.warn("Chart data is missing or invalid", chartData);
      return null;
  }

  // Generar ID único basado en el contenido del gráfico
  const chartId = generateChartId(chartData);
  
  // Componente de fallback por si el tipo de gráfico no es soportado
  const UnsupportedChart = () => (
      <p className="text-sm text-red-600">
          Unsupported chart type: {chartData.type}
      </p>
  );

  // Verificar si este gráfico ya se ha animado
  const hasAnimated = animatedCharts.has(chartId);

  // Configuración dinámica de animaciones
  const chartOptions = {
    ...chartData.options,
    animation: {
      duration: hasAnimated ? 0 : 1000, // Solo anima la primera vez
      onComplete: () => {
        // Marcar este gráfico como animado
        animatedCharts.set(chartId, true);
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      ...chartData.options?.plugins,
    }
  };

  // Seleccionamos el componente de gráfico correcto
  const getChartComponent = () => {
    switch (chartData.type) {
      case 'bar':
        return <Bar ref={chartRef} data={chartData.data} options={chartOptions} />;
      case 'pie':
        return <Pie ref={chartRef} data={chartData.data} options={chartOptions} />;
      case 'line':
        return <Line ref={chartRef} data={chartData.data} options={chartOptions} />;
      default:
        return <UnsupportedChart />;
    }
  };

  return (
    <div className="my-4 p-4 bg-white rounded-lg shadow-md border border-gray-200">
      {getChartComponent()}
    </div>
  );
};

export default ChatMessageChart;
