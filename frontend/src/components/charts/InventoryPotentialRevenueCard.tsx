import React, {useEffect, useState} from "react";
import {Card, Flex, Spin} from "antd";
import {useList} from "@refinedev/core";

interface PotentialRevenueCardProps {
    title?: string;
    resource?: string; // default will be "potentialRevenue"
}

const InventoryPotentialRevenueCard: React.FC<PotentialRevenueCardProps> = ({
                                                                                title = "Potential Revenue",
                                                                                resource = "analytics/inventory-potentialRevenue",
                                                                            }) => {
    const {data, isLoading} = useList({
        resource,
        pagination: {mode: "off"},
    });
    const defaultCurrency = "SAR";
    const color = "#39B533";

    const [value, setValue] = useState<number>(0);

    useEffect(() => {
        if (data?.data) {
            const record = data.data as unknown as { totalRevenue: number };
            setValue(record.totalRevenue ?? 0);
        }
    }, [data]);


    return (
        <Card
            title={title}
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

export default InventoryPotentialRevenueCard;
