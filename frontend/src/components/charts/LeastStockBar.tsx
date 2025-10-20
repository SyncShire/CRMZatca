import React from "react";
import { Card, Spin } from "antd";
import {useList, useNavigation} from "@refinedev/core";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

interface LeastStockBarProps {
    title?: string;
    colorPalette?: string[];
    maxItems?: number;
    valueField?: string;
    nameField?: string;
}

/**
 * Bar chart showing least-stock items.
 * Automatically calls resource `analytics/inventory-least-stock`.
 */
const LeastStockBar: React.FC<LeastStockBarProps> = ({
                                                         title = "Least Stock Items",
                                                         colorPalette = [
                                                             "#1869B9",
                                                             "#1869B9",
                                                             "#1869B9",
                                                             "#1869B9",
                                                             "#1869B9",
                                                             "#1869B9",
                                                             "#1869B9",
                                                             "#1869B9",
                                                         ],
                                                         maxItems = 8,
                                                         valueField = "current_stock",
                                                         nameField = "item_name",
                                                     }) => {
    const { data, isLoading } = useList({
        resource: "analytics/inventory-least-stock",
        pagination: { mode: "off" },
        filters: [
            {
                field: "limit",
                operator: "eq",
                value: 8,
            },
        ],
    });

    const rawData = data?.data || [];

    // Support both array-of-objects and object-map responses
    const normalizedData = Array.isArray(rawData)
        ? rawData
        : Object.entries(rawData).map(([key, value]) => ({
            [nameField]: key,
            [valueField]: value,
        }));

    const chartData = normalizedData
        .slice(0, maxItems)
        .map((item, index) => ({
            name: item[nameField],
            value: Number(item[valueField]) || 0,
            color: colorPalette[index % colorPalette.length],
        }));

    const { push } = useNavigation();

    const handleBarClick = (data: any) => {
        const clickedItem = data?.name; // or data.item_name depending on your chartData mapping
        if (clickedItem) {
            const query = new URLSearchParams();
            query.append("filters[0][field]", "item_name");
            query.append("filters[0][operator]", "eq");
            query.append("filters[0][value]", clickedItem);

            push(`/inventoryitems?${query.toString()}`);
        }
    };

    return (
        <Card
            title={title}
            size="small"
            style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                height: 300,
                textAlign: "center",
                marginBottom: "15px",
            }}
        >
            <Spin spinning={isLoading}>
                <ResponsiveContainer width="100%" height={230}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                    >
                        {/*<CartesianGrid strokeDasharray="3 3" /> */}
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} onClick={handleBarClick}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Spin>
        </Card>
    );
};

export default LeastStockBar;
