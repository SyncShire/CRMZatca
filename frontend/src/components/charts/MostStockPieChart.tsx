import React from "react";
import InventoryPieChart from "./InventoryPieChart";

const orangePalette = [
    "#E7AD73",
    "#DE8F3E",
    "#DA7F25",
    "#B3691E",
    "#8C5218",
    "#643B11",
    "#3D240A",
    "#160D04",
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
