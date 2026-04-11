import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
} from 'chart.js';
import { TicketStats } from '../../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface Props {
    stats: TicketStats;
}

const TicketStatsChart: React.FC<Props> = ({ stats }) => {
    const data = {
        labels: ['Reported', 'Error', 'Under Review', 'Resolved'],
        datasets: [
            {
                data: [
                    stats.reportedByUser,
                    stats.errorProcessing,
                    stats.underReview,
                    stats.resolved,
                ],
                backgroundColor: [
                    'rgba(220, 38, 38, 0.8)',    // red-600   — Reported by User
                    'rgba(234, 179, 8, 0.8)',    // yellow-500 — Automatic Error
                    'rgba(37, 99, 235, 0.8)',    // blue-600  — Under Review
                    'rgba(22, 163, 74, 0.8)',    // green-600 — Resolved
                ],
                borderColor: [
                    'rgba(220, 38, 38, 1)',
                    'rgba(234, 179, 8, 1)',
                    'rgba(37, 99, 235, 1)',
                    'rgba(22, 163, 74, 1)',
                ],
                borderWidth: 1,
                borderRadius: 6,
            },
        ],
    };

    const options = {
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx: any) => ` ${ctx.parsed.y} tickets`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 11 } },
            },
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: { precision: 0, font: { size: 11 } },
            },
        },
    };

    return (
        <div style={{ height: '200px' }}>
            <Bar data={data} options={options} />
        </div>
    );
};

export default TicketStatsChart;
