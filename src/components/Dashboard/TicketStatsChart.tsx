import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    type Plugin,
} from 'chart.js';
import { TicketStats } from '../../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const valueAboveBar: Plugin<'bar'> = {
    id: 'valueAboveBar',
    afterDraw(chart) {
        const { ctx, data } = chart;
        ctx.save();
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillStyle = '#374151'; // gray-700
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        chart.getDatasetMeta(0).data.forEach((bar, i) => {
            const value = data.datasets[0].data[i] as number;
            if (value > 0) {
                ctx.fillText(String(value), bar.x, bar.y - 3);
            }
        });
        ctx.restore();
    },
};

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
                borderSkipped: false,
                maxBarThickness: 48,
            },
        ],
    };

    const options = {
        maintainAspectRatio: false,
        layout: { padding: { top: 16 } },
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
                display: false,
                beginAtZero: true,
                suggestedMax: 3,
            },
        },
    };

    return (
        <div style={{ height: '140px' }}>
            <Bar data={data} options={options} plugins={[valueAboveBar]} />
        </div>
    );
};

export default TicketStatsChart;
