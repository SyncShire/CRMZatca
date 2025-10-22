import React, {useEffect, useState} from "react";
import {Card, Flex, Spin, Tooltip} from "antd";
import {useList} from "@refinedev/core";

interface InventoryValueCardProps {
    title?: string;
    resource?: string; // default will be "inventoryValue"
}

const defaultCurrency = "SAR";
const color = "#1869B9";

const InventoryValueCard: React.FC<InventoryValueCardProps> = ({
                                                                   title = "Inventory Value",
                                                                   resource = "analytics/inventory-value",
                                                               }) => {
    const {data, isLoading} = useList({
        resource,
        pagination: {mode: "off"},
    });

    const [value, setValue] = useState<number>(0);

    useEffect(() => {
        if (data?.data) {
            const record = data.data as unknown as { totalValue: number };
            setValue(record.totalValue ?? 0);
        }
    }, [data]);

    return (
        <Card
            title={<Tooltip title="Cost Price Of Inventory">
                {title}
            </Tooltip>}
            size="small"
            style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                height: 185,
                textAlign: "center",
                marginBottom: "15px",
            }}
        >
            <div style={{flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center"}}>
                <Spin spinning={isLoading}>
                    <div>
                        <div
                            style={{
                                fontSize: "clamp(28px, 4vw, 42px)",
                                fontWeight: 700,
                                color: color,
                                lineHeight: 1,
                                marginTop: "30px",
                            }}
                        >
                            {value.toLocaleString()}
                        </div>
                        <div style={{fontSize: 16, color: color, fontWeight: 500}}>{defaultCurrency}</div>
                    </div>
                </Spin>
            </div>
        </Card>
    );
};

export default InventoryValueCard;
