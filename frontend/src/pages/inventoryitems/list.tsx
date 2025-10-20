import type {PropsWithChildren} from "react";
import {getDefaultFilter, useGo} from "@refinedev/core";
import {
    CreateButton,
    DeleteButton,
    EditButton,
    FilterDropdown,
    getDefaultSortOrder,
    List,
    TagField,
    useSelect,
    useTable,
} from "@refinedev/antd";
import {EyeOutlined, SearchOutlined} from "@ant-design/icons";
import {Avatar, Col, Flex, Input, Row, Select, Table, Typography} from "antd";
import {getRandomColorFromString} from "@/utils/get-random-color";
import type {InventoryItem, Invoice} from "@/types";
import LeastStockPieChart from "@/components/charts/LeastStockPieChart"
import MostStockPieChart from "@/components/charts/MostStockPieChart"
import InventoryValueCard from "@/components/charts/InventoryValueCard";
import InventoryPotentialRevenueCard from "@/components/charts/InventoryPotentialRevenueCard";

export const InventoryItemsPageList = ({children}: PropsWithChildren) => {
    const go = useGo();

    const {tableProps, filters, sorters} = useTable<InventoryItem>({
        sorters: {
            initial: [{field: "updatedAt", order: "desc"}],
        },
        filters: {
            initial: [
                {
                    field: "item_name",
                    operator: "contains",
                    value: "",
                },
            ],
        },
        meta: {
            populate: ["inventoryitems"],
        },
    });

    const {selectProps: inventoryItemNameSelectProps} = useSelect({
        resource: "inventoryitems",
        optionLabel: "item_name",
        optionValue: "item_name",
    });

    const {selectProps: inventoryItemStatusSelectProps} = useSelect({
        resource: "inventoryitems",
        optionLabel: "item_code",
        optionValue: "item_code",
    });
    const defaultCurrencySymbol = "SAR";


    return (
        <>
            <Row gutter={[16, 16]}>
                <Col xs={24} md={6}>
                    <LeastStockPieChart />
                </Col>
                <Col xs={24} md={6}>
                    <MostStockPieChart />
                </Col>
                <Col xs={24} md={6}>
                    <InventoryValueCard />
                </Col>
                <Col xs={24} md={6}>
                    <InventoryPotentialRevenueCard />
                </Col>
            </Row>
            <List
                title="Inventory"
                headerButtons={() => {
                    return (
                        <CreateButton
                            size="large"
                            onClick={() =>
                                go({
                                    to: {resource: "inventoryitems", action: "create"},
                                    options: {keepQuery: true},
                                })
                            }
                        >
                            Add new inventoryItem
                        </CreateButton>
                    );
                }}
            >
                <Table
                    {...tableProps}
                    rowKey={"id"}
                    pagination={{
                        ...tableProps.pagination,
                        showSizeChanger: true,
                    }}
                    scroll={{x: "960px"}}
                >
                    <Table.Column
                        title="ID"
                        dataIndex="id"
                        key="id"
                        width={80}
                        defaultFilteredValue={getDefaultFilter("id", filters)}
                        filterIcon={<SearchOutlined/>}
                        filterDropdown={(props) => {
                            return (
                                <FilterDropdown {...props}>
                                    <Input placeholder="Search ID"/>
                                </FilterDropdown>
                            );
                        }}
                    />
                    <Table.Column
                        title="tem Name"
                        dataIndex="item_name"
                        key="item_name"
                        sorter
                        defaultSortOrder={getDefaultSortOrder("item_name", sorters)}
                        defaultFilteredValue={getDefaultFilter(
                            "item_name",
                            filters,
                            "in"
                        )}
                        filterDropdown={(props) => (
                            <FilterDropdown {...props}>
                                <Select
                                    mode="multiple"
                                    placeholder="Search Item Name"
                                    style={{width: 220}}
                                    {...inventoryItemNameSelectProps}
                                />
                            </FilterDropdown>
                        )}
                        render={(name: string, record: InventoryItem) => {
                            const src = null;

                            return (
                                <Flex align="center" gap={8}>
                                    <Avatar
                                        alt={name}
                                        src={src}
                                        shape="square"
                                        style={{
                                            backgroundColor: src
                                                ? "none"
                                                : getRandomColorFromString(name),
                                        }}
                                    >
                                        <Typography.Text>
                                            {name?.[0]?.toUpperCase()}
                                        </Typography.Text>
                                    </Avatar>
                                    <Typography.Text>{name}</Typography.Text>
                                </Flex>
                            );
                        }}
                    />

                    <Table.Column
                        title="Item Code"
                        dataIndex="item_code"
                        key="item_code"
                        width={154}
                        defaultFilteredValue={getDefaultFilter(
                            "item_code",
                            filters,
                            "contains"
                        )}
                        filterIcon={<SearchOutlined/>}
                        filterDropdown={(props) => {
                            return (
                                <FilterDropdown {...props}>
                                    <Input placeholder="Search Item Code"/>
                                </FilterDropdown>
                            );
                        }}
                    />
                    <Table.Column
                        title="Stock"
                        dataIndex="current_stock"
                        key="current_stock"
                        width={106}
                        sorter
                        defaultSortOrder={getDefaultSortOrder("current_stock", sorters)}
                        defaultFilteredValue={getDefaultFilter(
                            "current_stock",
                            filters,
                            "in"
                        )}
                        render={(_, record: InventoryItem) => {
                            return (
                                <TagField
                                    value={`${record.current_stock}`}
                                    color={
                                        record.current_stock === 0
                                            ? "volcano"
                                            : record.current_stock < 5
                                                ? "red"
                                                : record.current_stock < 10
                                                    ? "gold"
                                                    : "green"
                                    }
                                />
                            );
                        }}
                    />
                    <Table.Column
                        title="Cost Price"
                        dataIndex="cost_price"
                        key="cost_price"
                        width={154}
                        sorter
                        defaultSortOrder={getDefaultSortOrder("cost_price", sorters)}
                        defaultFilteredValue={getDefaultFilter(
                            "cost_price",
                            filters,
                            "contains"
                        )}
                        filterIcon={<SearchOutlined/>}
                        render={(_, record: InventoryItem) => {
                            return (
                                <TagField
                                    value={`${defaultCurrencySymbol} ${record.cost_price}`}
                                    color="orange"
                                />
                            );
                        }}
                    />
                    <Table.Column
                        title="Selling Price"
                        dataIndex="selling_price"
                        key="selling_price"
                        width={154}
                        sorter
                        defaultSortOrder={getDefaultSortOrder("selling_price", sorters)}
                        defaultFilteredValue={getDefaultFilter(
                            "selling_price",
                            filters,
                            "contains"
                        )}
                        filterIcon={<SearchOutlined/>}
                        render={(_, record: InventoryItem) => {
                            return (
                                <TagField
                                    value={`${defaultCurrencySymbol} ${record.selling_price}`}
                                    color="cyan"
                                />
                            );
                        }}
                    />
                    <Table.Column
                        title="Tax %"
                        dataIndex="tax_rate"
                        key="tax_rate"
                        width={154}
                        defaultFilteredValue={getDefaultFilter(
                            "tax_rate",
                            filters,
                            "contains"
                        )}
                        filterIcon={<SearchOutlined/>}
                        render={(_, record: InventoryItem) => {
                            return (
                                <TagField
                                    value={`% ${record.tax_rate}`}
                                    color="blue"
                                />
                            );
                        }}
                    />
                    <Table.Column
                        title="Discount %"
                        dataIndex="discount_rate"
                        key="discount_rate"
                        width={154}
                        sorter
                        defaultSortOrder={getDefaultSortOrder("discount_rate", sorters)}
                        defaultFilteredValue={getDefaultFilter(
                            "discount_rate",
                            filters,
                            "contains"
                        )}
                        filterIcon={<SearchOutlined/>}
                        render={(_, record: InventoryItem) => {
                            return (
                                <TagField
                                    value={`% ${record.discount_rate}`}
                                    color="red"
                                />
                            );
                        }}
                    />
                    <Table.Column
                        title="Actions"
                        key="actions"
                        fixed="right"
                        align="end"
                        width={106}
                        render={(_, record: InventoryItem) => {
                            return (
                                <Flex align="center" gap={8}>
                                    <EditButton
                                        size="small"
                                        hideText
                                        recordItemId={record.id}
                                        icon={<EyeOutlined/>}
                                    />
                                    <DeleteButton
                                        size="small"
                                        hideText
                                        recordItemId={record.id}
                                    />
                                </Flex>
                            );
                        }}
                    />
                </Table>
            </List>
            {children}
        </>
    );
};
