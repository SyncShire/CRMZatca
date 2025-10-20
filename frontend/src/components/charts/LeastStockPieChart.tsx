import React from "react";
import InventoryPieChart from "./InventoryPieChart";

const bluePalette = [
    "#E7AD73",
    "#DE8F3E",
    "#DA7F25",
    "#B3691E",
    "#8C5218",
    "#643B11",
    "#3D240A",
    "#160D04",
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
