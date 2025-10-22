import type { PropsWithChildren } from "react";
import { getDefaultFilter, useGo } from "@refinedev/core";
import {
    CreateButton,
    DeleteButton,
    EditButton,
    FilterDropdown,
    List,
    NumberField,
    getDefaultSortOrder,
    useSelect,
    useTable, TagField,
} from "@refinedev/antd";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { Avatar, Flex, Input, Select, Table, Typography } from "antd";
import {roundHalfUp} from "@/utils/helperMethods";
import { getRandomColorFromString } from "@/utils/get-random-color";
import type { Account } from "@/types";

export const AccountsPageList = ({ children }: PropsWithChildren) => {
  const go = useGo();

  const { tableProps, filters, sorters } = useTable<Account>({
    sorters: {
      initial: [{ field: "updatedAt", order: "desc" }],
    },
    filters: {
      initial: [
        {
          field: "account_name",
          operator: "contains",
          value: "",
        },
      ],
    },
    meta: {
      populate: ["logo", "invoices"],
    },
  });

  const { selectProps: accountNameSelectProps } = useSelect({
    resource: "accounts",
    optionLabel: "account_name",
    optionValue: "account_name",
  });

  const { selectProps: selectPropsOwnerName } = useSelect({
    resource: "accounts",
    optionLabel: "owner_name",
    optionValue: "owner_name",
  });

    let currencySymbol = "$";

  return (
    <>
      <List
        title="Accounts"
        headerButtons={() => {
          return (
            <CreateButton
              size="large"
              onClick={() =>
                go({
                  to: { resource: "accounts", action: "create" },
                  options: { keepQuery: true },
                })
              }
            >
              Add new account
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
          scroll={{ x: "960px" }}
        >
          <Table.Column
            title="ID"
            dataIndex="id"
            key="id"
            width={80}
            defaultFilteredValue={getDefaultFilter("id", filters)}
            filterIcon={<SearchOutlined />}
            filterDropdown={(props) => {
              return (
                <FilterDropdown {...props}>
                  <Input placeholder="Search ID" />
                </FilterDropdown>
              );
            }}
          />
          <Table.Column
            title="Account Name"
            dataIndex="account_name"
            key="account_name"
            sorter
            defaultSortOrder={getDefaultSortOrder("account_name", sorters)}
            defaultFilteredValue={getDefaultFilter(
              "account_name",
              filters,
              "in"
            )}
            filterDropdown={(props) => (
              <FilterDropdown {...props}>
                <Select
                  mode="multiple"
                  placeholder="Search Account Name"
                  style={{ width: 220 }}
                  {...accountNameSelectProps}
                />
              </FilterDropdown>
            )}
            render={(name: string, record: Account) => {
              const logoUrl = record?.logo;
              const src = logoUrl;

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
            title="Owner"
            dataIndex="owner_name"
            key="owner_name"
            sorter
            defaultSortOrder={getDefaultSortOrder("owner_name", sorters)}
            defaultFilteredValue={getDefaultFilter("owner_name", filters, "in")}
            filterDropdown={(props) => (
              <FilterDropdown {...props}>
                <Select
                  mode="multiple"
                  placeholder="Search Owner Name"
                  style={{ width: 220 }}
                  {...selectPropsOwnerName}
                />
              </FilterDropdown>
            )}
          />
          <Table.Column
            title="Email"
            dataIndex="owner_email"
            key="owner_email"
            defaultFilteredValue={getDefaultFilter(
              "owner_email",
              filters,
              "contains"
            )}
            filterIcon={<SearchOutlined />}
            filterDropdown={(props) => {
              return (
                <FilterDropdown {...props}>
                  <Input placeholder="Search Email" />
                </FilterDropdown>
              );
            }}
          />
          <Table.Column
            title="Phone"
            dataIndex="phone"
            key="phone"
            width={154}
            defaultFilteredValue={getDefaultFilter(
              "phone",
              filters,
              "contains"
            )}
            filterIcon={<SearchOutlined />}
            filterDropdown={(props) => {
              return (
                <FilterDropdown {...props}>
                  <Input placeholder="Search Phone" />
                </FilterDropdown>
              );
            }}
          />
          <Table.Column
            title="Income"
            dataIndex="total"
            key="total"
            sorter
            width={120}
            align="end"
            render={(_, record: Account) => {
              let total = 0;
              let currency = "USD";
              record.invoices?.forEach((invoice) => {
                total += invoice.total;
                currency = invoice.currency;
              });
              return (
                  <TagField value={`${currencySymbol} ${roundHalfUp(total, 2)}`} color="green" />
                // <NumberField
                //   value={total}
                //   options={{ style: "currency", currency: currency }}
                // />
              );
            }}
          />
          <Table.Column
            title="Actions"
            key="actions"
            fixed="right"
            align="end"
            width={106}
            render={(_, record: Account) => {
              return (
                <Flex align="center" gap={8}>
                  <EditButton
                    size="small"
                    hideText
                    recordItemId={record.id}
                    icon={<EyeOutlined />}
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
