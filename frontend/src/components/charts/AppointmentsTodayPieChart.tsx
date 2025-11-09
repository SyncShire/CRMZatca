import React, { useMemo } from "react";
import { Card, Spin } from "antd";
import { useList, useNavigation } from "@refinedev/core";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import dayjs from "dayjs";

const STATUS_COLORS: Record<string, string> = {
    new: "#1869B9",       // blue
    done: "#4CAF50",      // green
    cancelled: "#E09B2B", // red
};

const AppointmentsTodayPieChart: React.FC = () => {
    const { data, isLoading } = useList({
        resource: "events", // or "appointments"
        pagination: { pageSize: 1000 },
    });

    const { push } = useNavigation();

    const today = dayjs().startOf("day");

    const todaysAppointments = useMemo(
        () =>
            data?.data?.filter((event: any) =>
                dayjs(event.date).isSame(today, "day")
            ) || [],
        [data]
    );

    const statusCounts = useMemo(() => {
        return todaysAppointments.reduce((acc: Record<string, number>, curr: any) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1;
            return acc;
        }, {});
    }, [todaysAppointments]);

    const chartData = Object.keys(statusCounts).map((status) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: statusCounts[status],
        color: STATUS_COLORS[status.toLowerCase()] || "#8884d8",
    }));

    const handleSectorClick = (data: any) => {
        const clickedStatus = data?.name?.toLowerCase();
        if (!clickedStatus) return;

        const date = dayjs().format("YYYY-MM-DD");
        const query = new URLSearchParams();

        query.append("filters[0][field]", "status");
        query.append("filters[0][operator]", "eq");
        query.append("filters[0][value]", clickedStatus);

        query.append("filters[1][field]", "date");
        query.append("filters[1][operator]", "eq");
        query.append("filters[1][value]", date);

        push(`/events?${query.toString()}`);
    };

    return (
        <Card
            title="Appointments Today"
            size="small"
            style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                height: "auto",
                textAlign: "center",
                marginBottom: "15px",
            }}
        >
            <Spin spinning={isLoading}>
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={75}
                            outerRadius={95}
                            paddingAngle={3}
                            onClick={handleSectorClick}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            iconSize={10}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </Spin>
        </Card>
    );
};

export default AppointmentsTodayPieChart;
