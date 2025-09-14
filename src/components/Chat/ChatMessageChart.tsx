import React, { useRef, FC } from 'react';
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
  ChartData,
  ChartOptions,
} from 'chart.js';

// Register all necessary Chart.js components
ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement
);

// --- MODIFIED: Redefined ChartDataType as a discriminated union ---
// This allows TypeScript to infer the correct data/options types based on the 'type' property.
export type ChartDataType =
  | { type: 'bar'; data: ChartData<'bar'>; options?: ChartOptions<'bar'> }
  | { type: 'pie'; data: ChartData<'pie'>; options?: ChartOptions<'pie'> }
  | { type: 'line'; data: ChartData<'line'>; options?: ChartOptions<'line'> };


// Define the structure of the chart component's props
interface ChartMessageProps {
  chartData: ChartDataType;
}

// A global map to track which charts have already been animated
const animatedCharts = new Map<string, boolean>();

// A simple hash function to generate a unique ID from chart content
const generateChartId = (chartData: ChartDataType): string => {
  const content = JSON.stringify({
    type: chartData.type,
    labels: chartData.data?.labels,
    datasets: chartData.data?.datasets?.map(ds => ({ label: ds.label, data: ds.data }))
  });
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `chart-${Math.abs(hash)}`;
};

const ChatMessageChart: FC<ChartMessageProps> = ({ chartData }) => {
  const chartRef = useRef(null);
  
  if (!chartData || !chartData.type || !chartData.data) {
      console.warn("Chart data is missing or invalid", chartData);
      return null;
  }

  // Generate a unique ID based on the chart's content
  const chartId = generateChartId(chartData);
  
  // A fallback component for unsupported chart types
  const UnsupportedChart = () => (
      <p className="text-sm text-red-600">Unsupported chart type: {(chartData as any).type}</p>
  );

  // --- REFACTORED: Moved options logic inside the component renderer ---
  // This ensures TypeScript correctly narrows the types for each case.
  const getChartComponent = () => {
    const hasAnimated = animatedCharts.has(chartId);

    // Define common options that apply to all chart types
    const commonOptions = {
        animation: {
            duration: hasAnimated ? 0 : 1000, // Only animate on the first render
            onComplete: () => {
                animatedCharts.set(chartId, true); // Mark this chart as animated
            },
        },
        responsive: true,
        maintainAspectRatio: false,
    };

    // Because 'chartData' is a discriminated union, TypeScript now knows that
    // inside 'case: bar', chartData.data is of type ChartData<'bar'>, fixing the error.
    switch (chartData.type) {
      case 'bar':
        return <Bar ref={chartRef} data={chartData.data} options={{...commonOptions, ...chartData.options}} />;
      case 'pie':
        return <Pie ref={chartRef} data={chartData.data} options={{...commonOptions, ...chartData.options}} />;
      case 'line':
        return <Line ref={chartRef} data={chartData.data} options={{...commonOptions, ...chartData.options}} />;
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