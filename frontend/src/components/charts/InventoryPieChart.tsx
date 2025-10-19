import React, {useEffect, useState} from "react";
import {Card, Spin} from "antd";
import {useList} from "@refinedev/core";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Sector,
} from "recharts";

interface InventoryPieChartProps {
    title: string;
    resource: string; // API endpoint like analytics/inventory-least-stock
    colorPalette: string[];
    dataKey?: string; // default "value"
    nameKey?: string; // default "name"
    valueField?: string; // backend field for value (default "current_stock")
    nameField?: string; // backend field for label (default "item_name")
}

const renderActiveShape = (props: any) => {
    const {
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
        fill,
        payload,
        percent,
        value,
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
            <text
                x={mx + (cos >= 0 ? 1 : -1) * 12}
                y={my}
                textAnchor={cos >= 0 ? "start" : "end"}
                fill="#999"
            >
                {/*{payload?.name}*/}
            </text>
            <text
                x={mx + (cos >= 0 ? 1 : -1) * 12}
                y={my + 16}
                textAnchor={cos >= 0 ? "start" : "end"}
                fill="#999"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        </g>
    );
};

const InventoryPieChart: React.FC<InventoryPieChartProps> = ({
                                                                 title,
                                                                 resource,
                                                                 colorPalette,
                                                                 dataKey = "value",
                                                                 nameKey = "name",
                                                                 valueField = "current_stock",
                                                                 nameField = "item_name",
                                                             }) => {
        const {data, isLoading} = useList({
            resource,
            pagination: {mode: "off"},
        });

        const [chartData, setChartData] = useState<any[]>([]);
        const [activeIndex, setActiveIndex] = useState<number>(0);

        useEffect(() => {
                if (data?.data) {
                    let formatted: any[] = [];
                    const entries = Object.entries(data.data);
                    formatted = entries
                        .map(([name, value], index) => ({
                            name,
                            value: Number(value),
                            color: colorPalette[index % colorPalette.length],
                        }))
                        .slice(0, 8);
                    setChartData(formatted);
                }
            }, [data]
        )
        ;


        const onPieEnter = (_: any, index: number) => {
            setActiveIndex(index);
        };

        return (
            <Card
                title={title}
                size={"small"}
                style={{
                    borderRadius: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    height: 185,
                    textAlign: "center",
                    marginBottom: "15px",
                }}
            >
                <Spin spinning={isLoading}>
                    <ResponsiveContainer width="100%" height={130}>
                        <PieChart>
                            <Pie
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                data={chartData}
                                dataKey={dataKey}
                                nameKey={nameKey}
                                innerRadius={45}
                                outerRadius={55} // slightly smaller
                                paddingAngle={2}
                                onMouseEnter={onPieEnter}
                            >
                                {chartData.map((entry) => (
                                    <Cell key={entry.name} fill={entry.color}/>
                                ))}
                            </Pie>
                            <Tooltip/>
                        </PieChart>
                    </ResponsiveContainer>
                </Spin>
            </Card>
        );
    }
;

export default InventoryPieChart;
