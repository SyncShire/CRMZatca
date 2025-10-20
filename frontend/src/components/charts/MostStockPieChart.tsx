import React from "react";
import InventoryPieChart from "./InventoryPieChart";

const orangePalette = [
    "#4596E8",
    "#6FADEC",
    "#4696E7",
    "#1C78D4",
    "#1869B9",
    "#135290",
    "#0D3B68",
    "#08243F",
];

const MostStockPieChart: React.FC = () => {
    return (
        <InventoryPieChart
            title="Most in Stock (Top 8)"
            resource="analytics/inventory-most-stock"
            colorPalette={orangePalette}
        />
    );
};

export default MostStockPieChart;
