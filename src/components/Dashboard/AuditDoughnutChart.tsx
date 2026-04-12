import React, { useRef, useCallback } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';

ChartJS.register(ArcElement, Tooltip);

interface Props {
    actionCounts: Record<string, number>;
    actions: string[];
    colors: string[];
}

const ACTION_LABELS: Record<string, string> = {
    USER_CREATED: 'User created',
    USER_UPDATED: 'User updated',
    USER_DELETED: 'User deleted',
    USER_ACTIVATED: 'User activated',
    USER_DEACTIVATED: 'User deactivated',
    USER_PASSWORD_CHANGED: 'Password changed',
    USER_ROLES_CHANGED: 'Roles changed',
    USER_ASSIGNED_TO_GROUP: 'Added to group',
    USER_REMOVED_FROM_GROUP: 'Removed from group',
    GROUP_CREATED: 'Group created',
    GROUP_UPDATED: 'Group updated',
    GROUP_DELETED: 'Group deleted',
    GROUP_USERS_ASSIGNED: 'Users assigned',
    GROUP_USER_REMOVED: 'User removed',
    GROUP_APIS_ASSIGNED: 'APIs assigned',
    GROUP_API_REMOVED: 'API removed',
    API_CREATED: 'API created',
    API_UPDATED: 'API updated',
    API_DELETED: 'API deleted',
    API_ASSIGNED_TO_GROUP: 'Assigned to group',
    API_REMOVED_FROM_GROUP: 'Removed from group',
};

const centerTextPlugin = {
    id: 'centerText',
    afterDraw(chart: ChartJS) {
        const labels = chart.data.labels as string[];
        if (labels?.length === 1 && labels[0] === 'No activity') {
            const { ctx, chartArea } = chart;
            const cx = (chartArea.left + chartArea.right) / 2;
            const cy = (chartArea.top + chartArea.bottom) / 2;
            ctx.save();
            ctx.font = '10px sans-serif';
            ctx.fillStyle = '#9ca3af';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('No activity', cx, cy);
            ctx.restore();
            return;
        }
        const total = (chart.data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
        if (total === 0) return;
        const { ctx, chartArea } = chart;
        const cx = (chartArea.left + chartArea.right) / 2;
        const cy = (chartArea.top + chartArea.bottom) / 2;
        ctx.save();
        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = '#1f2937';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(total), cx, cy);
        ctx.restore();
    },
};

const AuditDoughnutChart: React.FC<Props> = ({ actionCounts, actions, colors }) => {
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Only include actions with activity so empty segments don't clutter the tooltip
    const active = actions.reduce<{ action: string; value: number; color: string }[]>(
        (acc, a, i) => {
            const v = actionCounts[a] ?? 0;
            if (v > 0) acc.push({ action: a, value: v, color: colors[i] });
            return acc;
        },
        []
    );

    const total = active.reduce((s, x) => s + x.value, 0);
    const isEmpty = total === 0;

    const externalTooltip = useCallback((context: any) => {
        const el = tooltipRef.current;
        if (!el) return;
        const { tooltip } = context;
        if (tooltip.opacity === 0) {
            el.style.opacity = '0';
            return;
        }
        const dp = tooltip.dataPoints?.[0];
        el.textContent = dp ? `${dp.label}: ${dp.parsed}` : '';
        el.style.opacity = '1';
        el.style.left = `${tooltip.caretX}px`;
        el.style.top = `${tooltip.caretY}px`;
    }, []);

    const data = {
        labels: isEmpty ? ['No activity'] : active.map(x => ACTION_LABELS[x.action] ?? x.action),
        datasets: [
            {
                data: isEmpty ? [1] : active.map(x => x.value),
                backgroundColor: isEmpty ? ['#e5e7eb'] : active.map(x => x.color),
                borderWidth: 0,
                hoverOffset: isEmpty ? 0 : 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '68%' as const,
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: false,
                external: isEmpty ? undefined : externalTooltip,
            },
        },
        animation: { duration: 600 },
    };

    return (
        <div className="relative flex justify-center items-center" style={{ width: 100, height: 100 }}>
            <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />
            <div
                ref={tooltipRef}
                className="pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-gray-800 px-2 py-1 text-xs text-gray-200"
                style={{ opacity: 0, transform: 'translate(-50%, -120%)', transition: 'opacity 0.1s' }}
            />
        </div>
    );
};

export default AuditDoughnutChart;
