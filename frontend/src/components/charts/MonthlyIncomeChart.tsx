import React, { useEffect, useState } from "react";
import { useList, useNavigation } from "@refinedev/core";
import { Spin } from "antd";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

const MonthlyIncomeChart: React.FC = () => {
    const { data, isLoading } = useList({
        resource: "analytics/monthly-income",
    });

    const { push } = useNavigation();
    const [chartData, setChartData] = useState<{ month: string; income: number }[]>([]);

    useEffect(() => {
        if (data?.data) {
            const formattedData = data.data.map((item: any) => ({
                month: item.month,
                income: item.income,
            }));
            setChartData(formattedData);
        }
    }, [data]);

    const handleBarClick = (data: any) => {
        const clickedMonth = data?.month;
        if (clickedMonth) {
            const query = new URLSearchParams();
            query.append("filters[0][field]", "month");
            query.append("filters[0][operator]", "eq");
            query.append("filters[0][value]", clickedMonth);

            push(`/invoices?${query.toString()}`);
        }
    };

    return (
        <Spin spinning={isLoading}>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    {/*<CartesianGrid strokeDasharray="3 3" />*/}
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                        dataKey="income"
                        fill="#4CAF50"
                        onClick={handleBarClick}
                        cursor="pointer"
                    />
                </BarChart>
            </ResponsiveContainer>
        </Spin>
    );
};

export default MonthlyIncomeChart;
