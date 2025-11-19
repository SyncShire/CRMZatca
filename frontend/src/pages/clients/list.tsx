import type {PropsWithChildren} from "react";
import {getDefaultFilter, useGo} from "@refinedev/core";
import {
    CreateButton,
    DeleteButton,
    EditButton,
    FilterDropdown,
    List,
    NumberField,
    TagField,
    getDefaultSortOrder,
    useSelect,
    useTable,
} from "@refinedev/antd";
import {Avatar, Card, Flex, Input, Select, Table, Typography} from "antd";
import {
    EditOutlined,
    EyeOutlined,
    MailOutlined,
    SearchOutlined, ShopOutlined,
} from "@ant-design/icons";
import {getRandomColorFromString} from "@/utils/get-random-color";
import type {Client} from "@/types";

export const ClientsPageList = ({children}: PropsWithChildren) => {
    const go = useGo();

    let currencySymbol = "$";

    const {tableProps, filters, sorters} = useTable<Client>({
        sorters: {
            initial: [{field: "updatedAt", order: "desc"}],
        },
        filters: {
            initial: [
                {
                    field: "client_name",
                    operator: "contains",
                    value: "",
                },
            ],
        },
        meta: {
            populate: ["account", "account.logo", "account.owner_name", "invoices"],
        },
    });

    const {selectProps: selectPropsName} = useSelect({
        resource: "clients",
        optionLabel: "partyLegalEntityRegistrationName",
        optionValue: "partyLegalEntityRegistrationName",
    });

    const {selectProps: selectPropsAccountName} = useSelect({
        resource: "accounts",
        optionLabel: "account_name",
        optionValue: "account_name",
    });

    return (
        <>
            <List
                title="Customers"
                headerButtons={() => {
                    return (
                        <CreateButton
                            size="large"
                            onClick={() =>
                                go({
                                    to: {resource: "clients", action: "create"},
                                    options: {keepQuery: true},
                                })
                            }
                        >
                            Add new Customer
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
                        title="Account"
                        dataIndex="account.account_name"
                        key="account.account_name"
                        sorter
                        defaultSortOrder={getDefaultSortOrder(
                            "account.account_name",
                            sorters
                        )}
                        defaultFilteredValue={getDefaultFilter(
                            "account.account_name",
                            filters,
                            "in"
                        )}
                        filterDropdown={(props) => (
                            <FilterDropdown {...props}>
                                <Select
                                    mode="multiple"
                                    placeholder="Search Account"
                                    style={{width: 220}}
                                    {...selectPropsAccountName}
                                />
                            </FilterDropdown>
                        )}
                        render={(_, record: Client) => {
                            const logoUrl = record?.account?.logo;
                            const name = record?.account?.account_name || "";

                            return (
                                <Flex align="center" gap={8}>
                                    <Avatar
                                        alt={name}
                                        src={logoUrl}
                                        shape="square"
                                        style={{
                                            backgroundColor: logoUrl
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
                        title="Customer Name"
                        dataIndex="partyLegalEntityRegistrationName"
                        key="partyLegalEntityRegistrationName"
                        sorter
                        defaultSortOrder={getDefaultSortOrder("partyLegalEntityRegistrationName", sorters)}
                        defaultFilteredValue={getDefaultFilter(
                            "partyLegalEntityRegistrationName",
                            filters,
                            "in"
                        )}
                        filterDropdown={(props) => (
                            <FilterDropdown {...props}>
                                <Select
                                    mode="multiple"
                                    placeholder="Search Name"
                                    style={{width: 220}}
                                    {...selectPropsName}
                                />
                            </FilterDropdown>
                        )}
                    />
                    <Table.Column
                        title="Email"
                        dataIndex="client_email"
                        key="client_email"
                        defaultFilteredValue={getDefaultFilter(
                            "client_email",
                            filters,
                            "contains"
                        )}
                        filterIcon={<SearchOutlined/>}
                        filterDropdown={(props) => {
                            return (
                                <FilterDropdown {...props}>
                                    <Input placeholder="Search Email"/>
                                </FilterDropdown>
                            );
                        }}
                        render={(email: string) => (
                            <a href={`mailto:${email}`} style={{color: "#00c9ff"}}>
                                <MailOutlined style={{marginRight: 8}}/>
                                {email}
                            </a>
                        )}
                    />
                    <Table.Column
                        title="Phone Number"
                        dataIndex="phoneNumber"
                        key="phoneNumber"
                        width={120}
                        align="end"
                        sorter
                        defaultSortOrder={getDefaultSortOrder("phoneNumber", sorters)}
                        render={(phone: string) => (
                            <TagField value={phone || "N/A"} color="blue"/>
                        )}
                    />
                    <Table.Column
                        title="Actions"
                        key="actions"
                        fixed="right"
                        align="end"
                        width={106}
                        render={(_, record: Client) => {
                            return (
                                <Flex align="center" gap={8}>
                                    <EditButton
                                        size="small"
                                        hideText
                                        recordItemId={record.id}
                                        icon={<EditOutlined/>}
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
