import { useModal, useShow } from "@refinedev/core";
import { FilePdfOutlined } from "@ant-design/icons";
import {
  Button,
  Avatar,
  Card,
  Col,
  Divider,
  Flex,
  Row,
  Skeleton,
  Spin,
  Table,
  Typography,
  Modal,
} from "antd";
import { DateField, NumberField, Show } from "@refinedev/antd";
import { API_URL } from "@/utils/constants";
import { getRandomColorFromString } from "@/utils/get-random-color";
import type { Invoice, Service } from "@/types";
import { useStyles } from "./show.styled";
import { useState } from "react";
import { PdfLayout } from "../pdf";

export const InvoicesPageShow = () => {
  const { styles } = useStyles();

  const { query: queryResult } = useShow<Invoice>({
    meta: {
      populate: ["client", "account.logo", "account", "services"],
    },
  });

  const [record, setRecord] = useState<Invoice>();

  const invoice = queryResult?.data?.data;
  const loading = queryResult?.isLoading;
  const logoUrl = invoice?.account?.logo || undefined;

  const { show, visible, close } = useModal();

  return (
    <>
      <Show
        title="Invoices"
        // headerButtons={() => (
        //   <>
        //     <Button
        //       disabled={!invoice}
        //       icon={<FilePdfOutlined />}
        //       onClick={(event) => {
        //         event.stopPropagation();
        //         setRecord(invoice);
        //         show();
        //       }}
        //     >
        //       Preview PDF
        //     </Button>
        //   </>
        // )}
        contentProps={{
          styles: {
            body: {
              padding: 0,
            },
          },
          style: {
            background: "transparent",
          },
        }}
      >
        <div id="invoice-pdf" className={styles.container}>
          <Card
            bordered={false}
            title={
              <Typography.Text
                style={{
                  fontWeight: 400,
                }}
              >
                {loading ? (
                  <Skeleton.Button style={{ width: 100, height: 22 }} />
                ) : (
                  `Invoice ID #${invoice?.id}`
                )}
              </Typography.Text>
            }
            extra={
              <Flex gap={8} align="center">
                {loading ? (
                  <Skeleton.Button style={{ width: 140, height: 22 }} />
                ) : (
                  <>
                    <Typography.Text>Date:</Typography.Text>
                    <DateField
                      style={{ width: 84 }}
                      value={invoice?.invoiceDate}
                      format="DD/MM/YYYY"
                    />
                  </>
                )}
              </Flex>
            }
          >
            <Spin spinning={loading}>
              <Row className={styles.fromToContainer}>
                <Col xs={24} md={12}>
                  <Flex vertical gap={24}>
                    <Typography.Text>From:</Typography.Text>
                    <Flex gap={24}>
                      <Avatar
                        alt={invoice?.account?.account_name}
                        size={64}
                        src={logoUrl}
                        shape="square"
                        style={{
                          backgroundColor: logoUrl
                            ? "transparent"
                            : getRandomColorFromString(
                                invoice?.account?.account_name || ""
                              ),
                        }}
                      >
                        <Typography.Text
                          style={{
                            fontSize: "32px",
                          }}
                        >
                          {invoice?.account?.account_name?.[0]?.toUpperCase()}
                        </Typography.Text>
                      </Avatar>
                      <Flex vertical gap={8}>
                        <Typography.Text
                          style={{
                            fontWeight: 700,
                          }}
                        >
                          {invoice?.account?.account_name}
                        </Typography.Text>
                        <Typography.Text>
                          {invoice?.account?.address}
                        </Typography.Text>
                        <Typography.Text>
                          {invoice?.account?.phone}
                        </Typography.Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </Col>
                <Col xs={24} md={12}>
                  <Flex vertical gap={24} align="flex-end">
                    <Typography.Text>To:</Typography.Text>
                    <Flex vertical gap={8} align="flex-end">
                      <Typography.Text
                        style={{
                          fontWeight: 700,
                        }}
                      >
                        {invoice?.client?.partyLegalEntityRegistrationName}
                      </Typography.Text>
                      <Typography.Text>
                        {invoice?.client?.cityName}
                      </Typography.Text>
                      <Typography.Text>
                        {invoice?.client?.phoneNumber}
                      </Typography.Text>
                    </Flex>
                  </Flex>
                </Col>
              </Row>
            </Spin>

            <Divider
              style={{
                margin: 0,
              }}
            />
            <Flex vertical gap={24} className={styles.productServiceContainer}>
              <Typography.Title
                level={4}
                style={{
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                Items / Services
              </Typography.Title>
              <Table
                dataSource={invoice?.services || []}
                rowKey={"_id"}
                pagination={false}
                loading={loading}
                scroll={{ x: 960 }}
              >
                <Table.Column title="Item Name" dataIndex="name" key="name" />
                <Table.Column
                  title="Unit Price"
                  dataIndex="unitPrice"
                  key="unitPrice"
                  render={(unitPrice: number) => (
                    <NumberField
                      value={unitPrice}
                      options={{ style: "currency", currency: "USD" }}
                    />
                  )}
                />
                <Table.Column
                  title="Quantity"
                  dataIndex="quantity"
                  key="quantity"
                />
                <Table.Column
                  title="Discount"
                  dataIndex="item_discount_percentage"
                  key="item_discount_percentage"
                  render={(discount: number) => (
                    <Typography.Text>{`${discount}%`}</Typography.Text>
                  )}
                />

                <Table.Column
                  title="Total Price"
                  dataIndex="total"
                  key="total"
                  align="right"
                  width={128}
                  render={(_, record: Service) => {
                    return (
                      <NumberField
                        value={record.totalPrice}
                        options={{ style: "currency", currency: "USD" }}
                      />
                    );
                  }}
                />
              </Table>
              <Flex
                gap={16}
                vertical
                style={{
                  marginLeft: "auto",
                  marginTop: "24px",
                  width: "200px",
                }}
              >
                <Flex
                  justify="space-between"
                  style={{
                    paddingLeft: 32,
                  }}
                >
                  <Typography.Text className={styles.labelTotal}>
                    Subtotal:
                  </Typography.Text>
                  <NumberField
                    value={invoice?.subtotal || 0}
                    options={{ style: "currency", currency: "USD" }}
                  />
                </Flex>
                <Flex
                  justify="space-between"
                  style={{
                    paddingLeft: 32,
                  }}
                >
                  <Typography.Text className={styles.labelTotal}>
                    Tax:
                  </Typography.Text>
                  <Typography.Text>{invoice?.tax_percentage || 0}%</Typography.Text>
                </Flex>
                <Divider
                  style={{
                    margin: "0",
                  }}
                />
                <Flex
                  justify="space-between"
                  style={{
                    paddingLeft: 16,
                  }}
                >
                  <Typography.Text
                    className={styles.labelTotal}
                    style={{
                      fontWeight: 700,
                    }}
                  >
                    Total value:
                  </Typography.Text>
                  <NumberField
                    value={invoice?.total || 0}
                    options={{ style: "currency", currency: "USD" }}
                  />
                </Flex>
              </Flex>
            </Flex>
          </Card>
        </div>
      </Show>
      <Modal visible={visible} onCancel={close} width="80%" footer={null}>
        <PdfLayout record={record} />
      </Modal>
    </>
  );
};
