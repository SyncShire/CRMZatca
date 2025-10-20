import React, { useEffect, useMemo, useState } from "react";
import { Card, Spin } from "antd";
import { useList } from "@refinedev/core";
import {
    RadialBarChart,
    RadialBar,
    Legend,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export const LeastStockRadial: React.FC = () => {
    const title = "Least Stock";

    const colorPalette = [
        "#4E79A7",
        "#F28E2B",
        "#E15759",
        "#76B7B2",
        "#59A14F",
        "#EDC948",
        "#B07AA1",
        "#FF9DA7",
    ];
    const maxItems = 8;
    const valueField = "current_stock";
    const nameField = "item_name";

    const { data, isLoading } = useList({
        resource: "analytics/inventory-least-stock",
        pagination: { mode: "off" },
    });

    const [chartData, setChartData] = useState<
        { name: string; value: number; fill?: string }[]
    >([]);

    useEffect(() => {
        if (!data?.data) {
            setChartData([]);
            return;
        }

        let raw: any[] = [];

        if (!Array.isArray(data.data) && typeof data.data === "object") {
            raw = Object.entries(data.data).map(([name, val]) => ({
                name,
                value: Number(val) || 0,
            }));
        } else if (Array.isArray(data.data)) {
            raw = data.data.map((it: any) => {
                const name = it[nameField] ?? it.name ?? "Unknown";
                const value = Number(it[valueField] ?? it.value ?? 0);
                return { name, value };
            });
        } else {
            setChartData([]);
            return;
        }

        const filtered = raw.filter((r) => Number.isFinite(r.value));
        filtered.sort((a, b) => a.value - b.value);

        const sliced = filtered.slice(0, maxItems);

        const colored = sliced.map((d, i) => ({
            ...d,
            fill: colorPalette[i % colorPalette.length],
        }));

        setChartData(colored);
    }, [data]);

    const maxValue = useMemo(() => {
        if (!chartData.length) return 100;
        const mx = Math.max(...chartData.map((d) => d.value));
        return mx <= 0 ? 1 : Math.ceil(mx * 1.15);
    }, [chartData]);

    // label rendered inside each bar
    const renderLabel = (entry: any) => {
        const { cx, cy, midAngle, innerRadius, outerRadius, value } = entry;
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) / 2;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="#fff"
                fontSize={11}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ pointerEvents: "none", fontWeight: 600 }}
            >
                {value}
            </text>
        );
    };

    return (
        <Card
            title={title}
            size="small"
            style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                minHeight: 220,
                textAlign: "center",
                marginBottom: 16,
            }}
        >
            <Spin spinning={isLoading}>
                {chartData.length === 0 ? (
                    <div style={{ padding: 28, color: "#666" }}>No data</div>
                ) : (
                    <ResponsiveContainer width="100%" height={180}>
                        <RadialBarChart
                            innerRadius="20%"
                            outerRadius="90%"
                            cx="50%"
                            cy="50%"
                            data={chartData}
                            barSize={12}
                            startAngle={90}
                            endAngle={-270}
                        >
                            <RadialBar
                                background
                                dataKey="value"
                                cornerRadius={6}
                                label={renderLabel}
                            />
                            <Tooltip
                                formatter={(value: any, name: any, props: any) => [
                                    value,
                                    props?.payload?.name ?? name,
                                ]}
                            />

                        </RadialBarChart>
                    </ResponsiveContainer>
                )}
            </Spin>
        </Card>
    );
};

export default LeastStockRadial;
