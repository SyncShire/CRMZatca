import React from "react";
import {Card, Col, Row, Space} from "antd";
import MonthlyIncomeChart from "../../components/charts/MonthlyIncomeChart";
import {CalendarPage} from "@/components/calendar/Calendar";
import {AppointmentsTodayCard} from "../../components/charts/AppointmentsTodayCard";
import LeastStockPieChart from "@/components/charts/LeastStockPieChart";
import MostStockPieChart from "@/components/charts/MostStockPieChart";
import InventoryValueCard from "@/components/charts/InventoryValueCard";
import InventoryPotentialRevenueCard from "@/components/charts/InventoryPotentialRevenueCard";
import LeastStockBar from "@/components/charts/LeastStockBar";

export const DashboardPage: React.FC = () => {
    return (
        <>
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <AppointmentsTodayCard/>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Monthly Income Overview" bordered={false}>
                        <MonthlyIncomeChart/>
                    </Card>
                </Col>
            </Row>

            <Card title="Inventory Insights" bordered={false}
                  style={{marginTop: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={6}>
                        <LeastStockPieChart/>
                    </Col>
                    <Col xs={24} lg={6}>
                        <MostStockPieChart/>
                    </Col>
                    <Col xs={24} lg={6}>
                        <InventoryValueCard/>
                    </Col>
                    <Col xs={24} lg={6}>
                        <InventoryPotentialRevenueCard/>
                    </Col>
                </Row>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={24}>
                        <LeastStockBar/>
                    </Col>
                </Row>
            </Card>

            <Row gutter={[16, 16]} style={{marginTop: '20px'}}>
                <Col xs={24} lg={24}>
                    <Card title="Appointments" bordered={false}>
                        <CalendarPage/>
                    </Card>
                </Col>
            </Row>
        </>
    );
};
