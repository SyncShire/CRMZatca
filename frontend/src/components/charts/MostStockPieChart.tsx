import React from "react";
import InventoryPieChart from "./InventoryPieChart";

const orangePalette = [
    "#ADDBAF",
    "#8ECD90",
    "#6EBF70",
    "#4CAF50",
    "#409142",
    "#327134",
    "#245225",
    "#163217",
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
