import React from "react";
import InventoryPieChart from "./InventoryPieChart";

const bluePalette = [
    "#4596E8",
    "#6FADEC",
    "#4696E7",
    "#1C78D4",
    "#1869B9",
    "#135290",
    "#0D3B68",
    "#08243F",
];

const LeastStockPieChart: React.FC = () => {
    return (
        <InventoryPieChart
            title="Least in Stock (Top 8)"
            resource="analytics/inventory-least-stock"
            colorPalette={bluePalette}
        />
    );
};

export default LeastStockPieChart;
