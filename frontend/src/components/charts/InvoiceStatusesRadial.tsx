import React, { useEffect, useState } from "react";
import { Card, Spin } from "antd";
import {useList, useNavigation} from "@refinedev/core";
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from "recharts";

export const InvoiceStatusesRadial: React.FC = () => {
    const title = "Invoice Status Overview";

    // Modern pastel-friendly palette
    const COLORS: Record<string, string> = {
        Draft: "#ffc658", // orange/yellow - draft/pending
        "Validated W": "#8dd1e1", // cyan - waiting
        Validated: "#83a6ed", // green - success
        ValidationFailed: "#d0ed57", // pinkish red - failed
        Paid: "#a4de6c", // light green - paid/completed
        "ZatcaReported W": "#8884d8", // violet - waiting
        ZatcaReported: "#82ca9d", // green - success
        ZatcaReportingFailed: "#B07AA1", // pinkish red - failed
    };

    // 🧭 Fixed status order (so rings don't shift)
    const STATUS_ORDER = [
        "Draft",
        "Validated W",
        "Validated",
        "ValidationFailed",
        "Paid",
        "ZatcaReported W",
        "ZatcaReported",
        "ZatcaReportingFailed",
    ];
    const { data, isLoading } = useList({
        resource: "analytics/invoice-status", // <-- your backend route
        pagination: { mode: "off" },
    });

    const [chartData, setChartData] = useState<
        { name: string; uv: number; fill?: string }[]
    >([]);

    useEffect(() => {
        if (!data?.data) {
            setChartData([]);
            return;
        }

        let raw: any[] = [];

        // Handle both object and array formats
        if (!Array.isArray(data.data) && typeof data.data === "object") {
            raw = Object.entries(data.data).map(([name, val]) => ({
                name,
                uv: Number(val) || 0,
            }));
        } else if (Array.isArray(data.data)) {
            raw = data.data.map((it: any) => ({
                name: it.name ?? it.status ?? "Unknown",
                uv: Number(it.value ?? it.count ?? 0),
            }));
        }

        // Filter and sort in consistent order
        const filtered = raw
            .filter((r) => Number.isFinite(r.uv) && r.uv > 0)
            .sort(
                (a, b) =>
                    STATUS_ORDER.indexOf(a.name) - STATUS_ORDER.indexOf(b.name)
            );
        // Assign colors based on status from COLORS map
        const colored = filtered.map((d) => ({
            ...d,
            fill: COLORS[d.name as keyof typeof COLORS] || "#ccc", // fallback
        }));

        setChartData(colored);
    }, [data]);

    const legendStyle = {
        top: "50%",
        right: 0,
        transform: "translate(0, -50%)",
        lineHeight: "24px",
    };

    const { push } = useNavigation();

    const handleRadialBarClick = (data: any) => {
        const clickedItem = data?.name; // or data.item_name depending on your chartData mapping
        if (clickedItem) {
            const query = new URLSearchParams();
            query.append("filters[0][field]", "status");
            query.append("filters[0][operator]", "eq");
            query.append("filters[0][value]", clickedItem);

            push(`/invoices?${query.toString()}`);
        }
    };

    return (
        <Card
            title={title}
            size="small"
            style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                minHeight: 280,
                textAlign: "center",
                marginBottom: 16,
            }}
        >
            <Spin spinning={isLoading}>
                {chartData.length === 0 ? (
                    <div style={{ padding: 28, color: "#666" }}>No data</div>
                ) : (
                    <div style={{ width: "100%", height: 280 }}>
                        <ResponsiveContainer>
                            <RadialBarChart
                                cx="30%"
                                barSize={13}
                                data={chartData}
                                innerRadius="10%"
                                outerRadius="100%"
                                startAngle={90}
                                endAngle={-270}
                            >
                                <RadialBar
                                    background
                                    label={{ position: "insideStart", fill: "#fff" }}
                                    dataKey="uv"
                                    cornerRadius={5}
                                    onClick={handleRadialBarClick}
                                />
                                <Legend
                                    iconSize={10}
                                    layout="vertical"
                                    verticalAlign="middle"
                                    wrapperStyle={legendStyle}
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </Spin>
        </Card>
    );
};

export default InvoiceStatusesRadial;
