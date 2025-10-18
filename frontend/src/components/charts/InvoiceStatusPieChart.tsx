import React, {useEffect, useState} from "react";
import {Card, Spin} from "antd";
import {useList} from "@refinedev/core";
import {
    PieChart,

    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend, Sector,
} from "recharts";


const COLORS: Record<string, string> = {
    "Draft": "orange",
    "Validated W": "cyan",
    "Validated": "#674085",
    "ZatcaReported W": "#A0CFA2",
    "ZatcaReported": "#4CAF50",
    "ValidationFailed": "#F54927",
    "ZatcaReportingFailed": "red",
    "Paid": "#A8E6CF",
};

// Custom active slice
const renderActiveShape = (props: any) => {
    const {
        cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
        fill, payload, percent, value,
    } = props;
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;

    return (
        <g>
            {/*<text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontWeight="bold">*/}
            {/*    {payload.name}*/}
            {/*</text>*/}
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 10}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <path d={`M${sx},${sy}L${mx},${my}`} stroke={fill} fill="none"/>
            <circle cx={mx} cy={my} r={3} fill={fill} stroke="none"/>
            <text x={mx + (cos >= 0 ? 1 : -1) * 12} y={my} textAnchor={cos >= 0 ? "start" : "end"} fill="#999">
                {`Value: ${value}`}
            </text>
            <text x={mx + (cos >= 0 ? 1 : -1) * 12} y={my + 16} textAnchor={cos >= 0 ? "start" : "end"} fill="#999">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        </g>
    );
};


const InvoiceStatusPieChart: React.FC = () => {

    type StatusSummary = {
        Draft: number;
        "Validated W": number;
        Validated: number;
        ValidationFailed: number;
        Paid: number;
        "ZatcaReported W": number;
        ZatcaReported: number;
        ZatcaReportingFailed: number;
    };


    const {data, isLoading} = useList<StatusSummary>({
        resource: "analytics/invoice-status",
        pagination: { mode: "off" },
    });

    const [chartData, setChartData] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState<number>(0);

    useEffect(() => {
        if (data?.data) {
            const res: StatusSummary = data.data as unknown as StatusSummary;

            setChartData([
                { name: "Draft", value: res.Draft || 0, color: "orange" },
                { name: "Validated W", value: res["Validated W"] || 0, color: "cyan" },
                { name: "Validated", value: res.Validated || 0, color: "green" },
                { name: "ValidationFailed", value: res.ValidationFailed || 0, color: "red" },
                { name: "Paid", value: res.Paid || 0, color: "green" },
                { name: "ZatcaReported W", value: res["ZatcaReported W"] || 0, color: "cyan" },
                { name: "ZatcaReported", value: res.ZatcaReported || 0, color: "green" },
                { name: "ZatcaReportingFailed", value: res.ZatcaReportingFailed || 0, color: "red" },
            ]);
        }
    }, [data]);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    return (
        <Card
            title="Invoice Status Distribution"
            style={{borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)"}}
        >
            <Spin spinning={isLoading}>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        {/* Inner ring (just for style) */}
                        <Pie
                            activeShape={renderActiveShape}
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={3}
                        >
                            {chartData.map((entry) => (
                                <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS]}/>
                            ))}
                        </Pie>

                        {/* Outer ring (slightly bigger for emphasis) */}


                        <Tooltip/>
                    </PieChart>
                </ResponsiveContainer>
            </Spin>
        </Card>
    );
};

export default InvoiceStatusPieChart;
