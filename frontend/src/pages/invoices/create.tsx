import {Fragment, useState} from "react";
import {NumberField, Show, useForm, useSelect} from "@refinedev/antd";
import {
    Button,
    Card,
    Col,
    DatePicker,
    Divider,
    Flex,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Typography,
    Tag,
    Modal,
    Space,
    theme,

} from "antd";

const {Title, Text} = Typography;
import {
    DeleteOutlined,
    FileAddOutlined,
    FileDoneOutlined,
    FileTextOutlined,
    PlusCircleOutlined
} from "@ant-design/icons";
import type {InventoryItem, Invoice, Service} from "@/types";
import {useStyles} from "./create.styled";
import {taxTypeDescription} from "./taxTypeDescription";
import {useLocation} from "react-router-dom";
import {useGo, useList} from "@refinedev/core";

export const InvoicesPageCreate = () => {
    const go = useGo();
    const [tax, setTax] = useState<number>(15.00);
    const [services, setServices] = useState<Service[]>([
        {
            name: "",
            unitPrice: 0,
            unitCode: "PCE",
            item_code: "",
            quantity: 0,
            price_without_discount: 0,
            item_discount_percentage: 0,
            item_discount_amount: 0,
            totalPrice: 0,
            description: "",
        },
    ]);
    const subtotal = services.reduce(
        (acc, service) =>
            acc +
            (service.unitPrice * service.quantity * (100 - service.item_discount_percentage)) / 100,
        0
    );
    const totalDiscountAmount = services.reduce(
        (acc, service) =>
            acc + service.item_discount_amount, 0);

    const total = subtotal + (subtotal * tax) / 100;

    const {styles} = useStyles();

    const {formProps} = useForm<Invoice>();

    const {selectProps: selectPropsAccounts} = useSelect({
        resource: "accounts",
        optionLabel: "account_name",
        optionValue: "_id",
    });

    const {selectProps: selectPropsClients} = useSelect({
        resource: "clients",
        optionLabel: "partyLegalEntityRegistrationName",
        optionValue: "_id",
    });

    const {selectProps: selectPropsInventory} = useSelect({
        resource: "inventoryitems",     // API resource name
        optionLabel: "item_name",             // what user sees
        optionValue: "_id",
        pagination: { mode: "off" }
        // meta: {
        //     select: "item_name selling_price", // only fetch needed fields
        // },
    });

    const {data} = useList<InventoryItem>({
        resource: "inventoryitems",
    });
    const inventoryData = data?.data || [];

    const currencyOptions = [
        {value: "INR", label: "₹ INR"},
        {value: "USD", label: "$ USD"},
        {value: "EUR", label: "€ EUR"},
        {value: "GBP", label: "£ GBP"},
        {value: "JPY", label: "¥ JPY"},
        {value: "SAR", label: "﷼ SAR"},
    ];

    const statusOptions = [
        {value: "Draft", label: "Draft", color: "orange"},
        {value: "Validated W", label: "Valiadted W", color: "cyan"},
        {value: "Validated", label: "Validated", color: "green"},
        {value: "ValidationFailed", label: "ValidationFailed", color: "red"},
        {value: "Paid", label: "Paid", color: "green"},
        {value: "ZatcaReported W", label: "ZatcaReported W", color: "cyan"},
        {value: "ZatcaReported", label: "ZatcaReported", color: "green"},
        {value: "ZatcaReportingFailed", label: "ZatcaReportingFailed", color: "red"},
    ];

    const defaultCurrencySymbol = "SAR ﷼";
    const defaultCurrency = "SAR";
    const defaultStatus = "Draft";

    const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency);

    const [selectedCurrencySymbol, setSelectedCurrencySymbol] = useState(
        defaultCurrencySymbol
    );

    const [selectedStatus, setSelectedStatus] = useState(defaultStatus);

    const handleCurrencyChange = (value: React.SetStateAction<string>) => {
        let symbol = "";

        switch (value) {
            case "INR":
                symbol = "₹";
                break;
            case "USD":
                symbol = "$";
                break;
            case "EUR":
                symbol = "€";
                break;
            case "GBP":
                symbol = "£";
                break;
            case "JPY":
                symbol = "¥";
                break;
            case "SAR":
                symbol = "SAR ﷼";
                break;
            default:
                symbol = defaultCurrencySymbol;
        }
        setSelectedCurrencySymbol(symbol);
        setSelectedCurrency(value);
    };

    const handleStatusChange = (value: React.SetStateAction<string>) => {
        let status = "";

        switch (value) {
            case "Draft":
                status = "Draft";
                break;
            case "Validated W":
                status = "Validated W";
                break;
            case "Validated":
                status = "Validated";
                break;
            case "ValidationFailed":
                status = "ValidationFailed";
                break;
            case "Paid":
                status = "Paid";
                break;
            case "ZatcaReported W":
                status = "ZatcaReported W";
                break;
            case "ZatcaReported":
                status = "ZatcaReported";
                break;
            case "ZatcaReportingFailed":
                status = "ZatcaReportingFailed";
                break;
            default:
                status = defaultStatus;
        }
        setSelectedStatus(status);
    };

    const defaultTaxCategory = "S-Standard Rated Supply";
    const [selectTaxCategory, setSelectedTaxCategory] = useState(defaultTaxCategory);
    const taxCategoryOptions = [
        {value: "S-Standard Rated Supply", label: "S-Standard Rated Supply"},
        {value: "Z-Zero Rated Supply", label: "Z-Zero Rated Supply"},
        {value: "E-Exempt Supply", label: "E-Exempt Supply"},
        {value: "O-Out of Scope", label: "O-Out of Scope"},
    ];

    const handleTaxCategoryChange = (value: React.SetStateAction<string>) => {
        let taxCategory = "";
        switch (value) {
            case "S-Standard Rated Supply":
                taxCategory = "S-Standard Rated Supply";
                break;
            case "Z-Zero Rated Supply":
                taxCategory = "Z-Zero Rated Supply";
                break;
            case "E-Exempt Supply":
                taxCategory = "E-Exempt Supply";
                break;

            case "O-Out of Scope":
                taxCategory = "O-Out of Scope";
                break;

            default:
                taxCategory = defaultTaxCategory; // fallback
        }
        setSelectedTaxCategory(taxCategory);
    };


    const defaultPaymentMeans = "10-Cash";
    const [selectPaymentMeans, setSelectedPaymentMeans] = useState(defaultTaxCategory);
    const paymentMeansOptions = [
        {value: "10-Cash", label: "10-Cash", color: "green"},
        {value: "20-Cheque", label: "20-Cheque", color: "purple"},
        {value: "30-Credit Transfer", label: "30-Credit Transfer(Bank Transfer)", color: "blue"},
        {value: "31-Debit Transfer", label: "31-Debit Transfer", color: "cyan"},
        {value: "42-Payment to Bank Account", label: "42-Payment to Bank Account", color: "volcano"},
        {value: "48-Bank Card", label: "48-Bank Card (POS/Credit/Debit)", color: "gold"},
        {value: "49-Direct Debit", label: "49-Direct Debit", color: "magenta"},
        {value: "57-Standing Order", label: "57-Standing Order", color: "orange"},
        {value: "97-Other", label: "97-Other (Not Defined)", color: "red"},
        {value: "ZZZ-Mutually Defined", label: "ZZZ-Mutually Defined", color: "geekblue"},
    ];

    const handlePaymentMeansChange = (value: React.SetStateAction<string>) => {
        let paymentMeans = "";

        switch (value) {
            case "10-Cash":
                paymentMeans = "10-Cash"; // Cash
                break;
            case "20-Cheque":
                paymentMeans = "20-Cheque"; // Cheque
                break;
            case "30-Credit Transfer":
                paymentMeans = "30-Credit Transfer"; // Credit Transfer
                break;
            case "31-Debit Transfer":
                paymentMeans = "31-Debit Transfer"; // Debit Transfer
                break;
            case "42-Payment to Bank Account":
                paymentMeans = "42-Payment to Bank Account"; // Payment to Bank Account
                break;
            case "48-Bank Card":
                paymentMeans = "48-Bank Card"; // Bank Card
                break;
            case "49-Direct Debit":
                paymentMeans = "49-Direct Debit"; // Direct Debit
                break;
            case "57-Standing Order":
                paymentMeans = "57-Standing Order"; // Standing Order
                break;
            case "97-Other":
                paymentMeans = "97-Other"; // Other
                break;
            case "ZZZ-Mutually Defined":
                paymentMeans = "ZZZ-Mutually Defined"; // Mutually Defined
                break;
            default:
                paymentMeans = defaultPaymentMeans; // fallback
        }

        setSelectedPaymentMeans(paymentMeans);
    };

    const handleServiceNumbersChange = (
        index: number,
        key: "quantity" | "item_discount_percentage" | "unitPrice",
        value: number
    ) => {
        setServices((prev) => {
            const currentService = {...prev[index]};
            currentService[key] = value;

            let priceBeforeDiscount = currentService.unitPrice * currentService.quantity;
            currentService.totalPrice =
                priceBeforeDiscount *
                ((100 - currentService.item_discount_percentage) / 100);

            currentService.price_without_discount = priceBeforeDiscount;
            currentService.item_discount_amount = priceBeforeDiscount - currentService.totalPrice;
            return prev.map((item, i) => (i === index ? currentService : item));
        });
    };

    const userData = localStorage.getItem("user");
    let userId = "";
    if (userData) {
        const parsedUserData = JSON.parse(userData);
        userId = parsedUserData.userId;
    }

    const onFinishHandler = (values: Invoice) => {
        const valuesWithServices = {
            ...values,
            subtotal,
            total,
            tax_percentage: tax,
            total_discount_amount: totalDiscountAmount,
            userId: userId,
            date: new Date().toISOString(),
            services: services.filter((service) => service.name),
        };

        formProps?.onFinish?.(valuesWithServices);
    };

    const typeOptions = [
        {label: "Standard", value: "Standard", icon: <FileTextOutlined style={{fontSize: 32, color: '#722ed1'}}/>},
        {label: "Simplified", value: "Simplified", icon: <FileAddOutlined style={{fontSize: 32, color: '#52c41a'}}/>},
    ];
    const subTypeOptions = {
        standard: [
            {
                label: "Standard",
                value: "StandardInvoice",
                desc: "",
                icon: <FileTextOutlined style={{fontSize: 28, color: '#722ed1'}}/>
            },
            {
                label: "Standard Debit Note",
                value: "StandardInvoiceDebitNote",
                desc: "",
                icon: <FileAddOutlined style={{fontSize: 28, color: '#faad14'}}/>
            },
            {
                label: "Standard Credit Note",
                value: "StandardInvoiceCreditNote",
                desc: "",
                icon: <FileDoneOutlined style={{fontSize: 28, color: '#1890ff'}}/>
            },
        ],
        simplified: [
            {
                label: "Simplified",
                value: "SimplifiedInvoice",
                desc: "",
                icon: <FileTextOutlined style={{fontSize: 28, color: '#52c41a'}}/>
            },
            {
                label: "Simplified Debit Note",
                value: "SimplifiedInvoiceDebitNote",
                desc: "",
                icon: <FileAddOutlined style={{fontSize: 28, color: '#faad14'}}/>
            },
            {
                label: "Simplified Credit Note",
                value: "SimplifiedInvoiceCreditNote",
                desc: "",
                icon: <FileDoneOutlined style={{fontSize: 28, color: '#1890ff'}}/>
            },
        ],
    };

    const [showTypeModal, setShowTypeModal] = useState(true);
    const location = useLocation();
    const initialType = "StandardInvoice";
    const initialSubType = "StandardInvoice";
    const [invoiceType, setInvoiceType] = useState<string | null>(initialType);
    const [invoiceSubType, setInvoiceSubType] = useState<string | null>(initialSubType);
    const [step, setStep] = useState(0);
    const {token} = theme.useToken();


    // const defaultInvoiceType = "StandardInvoice";
    const [selectInvoiceType, setSelectedInvoiceType] = useState(invoiceType);
    const invoiceTypeOptions = [
        {value: "StandardInvoice", label: "Standard Invoice", color: "purple"},
        {value: "StandardInvoiceDebitNote", label: "Standard Debit Note", color: "orange"},
        {value: "StandardInvoiceCreditNote", label: "Standard Credit Note", color: "blue"},


        {value: "SimplifiedInvoice", label: "Simplified Invoice", color: "green"},
        {value: "SimplifiedInvoiceDebitNote", label: "Simplified Debit Note", color: "orange"},
        {value: "SimplifiedInvoiceCreditNote", label: "Simplified Credit Note", color: "blue"},

    ];

    const handleInvoiceTypeChange = (value: React.SetStateAction<string>) => {
        let invoiceType = "";

        switch (value) {
            case "Simplified Invoice":
                invoiceType = "SimplifiedInvoice";
                break;
            case "Simplified Invoice CreditNote":
                invoiceType = "SimplifiedInvoiceCreditNote";
                break;
            case "Simplified Invoice DebitNote":
                invoiceType = "SimplifiedInvoiceDebitNote";
                break;

            case "Standard Invoice":
                invoiceType = "StandardInvoice";
                break;
            case "Standard Invoice CreditNote":
                invoiceType = "StandardInvoiceCreditNote";
                break;
            case "Standard Invoice DebitNote":
                invoiceType = "StandardInvoiceDebitNote";
                break;

            default:
                invoiceType = invoiceSubType || "StandardInvoice"; // fallback
        }
        setSelectedInvoiceType(invoiceSubType);
    };

    return (
        <>
            <Modal
                open={showTypeModal}
                footer={null}
                closable={true}
                centered
                onCancel={(e) => {
                    go({
                        to: {resource: "invoices", action: "list"},
                        options: {keepQuery: true},
                    })
                }}
                bodyStyle={{padding: token.paddingLG}}
                maskClosable={false} // prevent accidental background click navigation
            >

                {/* Step indicators */}

                {/* Title */}
                <Title
                    level={4}
                    style={{textAlign: "center", marginBottom: token.marginLG}}
                >
                    {step === 0 ? "Select Invoice Type" : "Select Invoice Sub-Type"}
                </Title>

                {/* Step 0: Type selection */}
                {step === 0 && (
                    <Space
                        wrap
                        size="large"
                        style={{width: "100%", justifyContent: "center", marginBottom: token.marginMD}}
                    >
                        {typeOptions.map((opt) => (
                            <Card
                                key={opt.value}
                                hoverable
                                onClick={() => {
                                    setInvoiceType(opt.value);
                                    setStep(1);
                                }}
                                style={{
                                    width: "200px",
                                    height: "150px", // keep fixed height for vertical centering
                                    border:
                                        invoiceType === opt.value
                                            ? `2px solid ${token.colorPrimary}`
                                            : undefined,
                                    boxShadow:
                                        invoiceType === opt.value
                                            ? token.boxShadowSecondary
                                            : "none",
                                    cursor: "pointer",
                                    marginRight: "40px"
                                }}
                                bodyStyle={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: "100%", // ensure full height
                                    textAlign: "center",
                                    padding: token.paddingMD,
                                }}
                            >
                                <div style={{marginBottom: token.marginSM}}>{opt.icon}</div>
                                <Text strong>{opt.label}</Text>
                            </Card>
                        ))}
                    </Space>
                )}


                {/* Step 1: Sub-type selection */}
                {step === 1 && invoiceType && (
                    <>
                        <Space wrap={true} size="large" style={{width: "100%", marginBottom: token.marginMD}}>
                            {subTypeOptions[invoiceType.toLowerCase() as "standard" | "simplified"].map((opt) => (
                                <Card
                                    key={opt.value}
                                    hoverable
                                    onClick={() => {
                                        setInvoiceSubType(opt.value);
                                        setShowTypeModal(false); // ✅ close immediately on select
                                    }}
                                    style={{
                                        width: 200,
                                        textAlign: "center",
                                        border: invoiceSubType === opt.value ? `2px solid ${token.colorSuccess}` : undefined,
                                        boxShadow: invoiceSubType === opt.value ? token.boxShadowSecondary : "none",
                                    }}
                                >
                                    <div style={{marginBottom: token.marginXS}}>{opt.icon}</div>
                                    <Text strong>{opt.label}</Text>
                                    <Text type="secondary" style={{fontSize: 13}}>
                                        {opt.desc}
                                    </Text>
                                </Card>
                            ))}
                        </Space>

                        {/* Back button */}
                        <Button
                            block
                            style={{marginTop: token.marginXS}}
                            onClick={() => {
                                setStep(0);
                                setInvoiceSubType(null);
                            }}
                        >
                            Back
                        </Button>
                    </>
                )}
            </Modal>
            {!showTypeModal && (
                <Show
                    title="Invoices"
                    headerButtons={() => false}
                    contentProps={{
                        styles: {
                            body: {
                                padding: 0,
                            },
                        },
                        style: {
                            background: "transparent",
                            boxShadow: "none",
                        },
                    }}
                >
                    <Form
                        {...formProps}
                        initialValues={{
                            status: defaultStatus, currency: defaultCurrency, invoice_type: invoiceSubType,
                            tax_category: defaultTaxCategory, payment_means: defaultPaymentMeans
                        }}
                        onFinish={(values) => onFinishHandler(values as Invoice)}
                        layout="vertical"
                    >
                        <Flex vertical gap={32}>
                            <Typography.Title level={3}>New Invoice</Typography.Title>
                            <Card
                                bordered={false}
                                styles={{
                                    body: {
                                        padding: 24,
                                        borderRadius: 12,       // curve the edges
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",// restore inner padding for breathing space
                                    },
                                }}
                            >
                                <Row gutter={16}>
                                    <Col xs={24} sm={6}>
                                        <Form.Item
                                            label="Account"
                                            name="account"
                                            rules={[{required: true}]}
                                        >
                                            <Select
                                                {...selectPropsAccounts}
                                                placeholder="Please select account"
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={6}>
                                        <Form.Item
                                            label="Client"
                                            name="client"
                                            rules={[{required: true}]}

                                        >
                                            <Select
                                                {...selectPropsClients}
                                                placeholder="Please select client"
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={6}>
                                        <Form.Item
                                            label="Status"
                                            name="status"
                                            rules={[{required: true}]}
                                        >
                                            <Select
                                                disabled
                                                placeholder="Select Status"
                                                onChange={handleStatusChange}
                                                options={statusOptions.map((opt) => ({
                                                    value: opt.value,
                                                    label: (
                                                        <Tag color={opt.color} style={{marginRight: 0}}>
                                                            {opt.label}
                                                        </Tag>
                                                    ),
                                                }))}
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={6}>
                                        <Form.Item
                                            label="Invoice Date"
                                            name="invoiceDate"
                                            rules={[
                                                {
                                                    required: true,
                                                },
                                            ]}
                                        >
                                            <DatePicker format="DD-MM-YYYY"/>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col xs={24} sm={6}>
                                        <Form.Item
                                            label="Invoice Type"
                                            name="invoice_type"
                                            rules={[{required: true}]}
                                        >
                                            <Select
                                                placeholder="Select Invoice Type"
                                                onChange={handleInvoiceTypeChange}
                                                options={invoiceTypeOptions.map((opt) => ({
                                                    value: opt.value,
                                                    label: (
                                                        <Tag color={opt.color} style={{marginRight: 0}}>
                                                            {opt.label}
                                                        </Tag>
                                                    ),
                                                }))}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={6}>
                                        <Form.Item
                                            label="Currency"
                                            name="currency"
                                            rules={[{required: true}]}

                                        >
                                            <Select
                                                placeholder="Select Currency"
                                                options={currencyOptions}
                                                onChange={handleCurrencyChange}
                                                disabled
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={6}>
                                        <Form.Item
                                            label="TAX Category"
                                            name="tax_category"
                                            tooltip={taxTypeDescription}
                                            rules={[{required: true}]}
                                        >
                                            <Select
                                                placeholder="Select Tax Category"
                                                onChange={handleTaxCategoryChange}
                                                options={taxCategoryOptions}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={6}>
                                        <Form.Item
                                            label="Delivery Date"
                                            name="deliveryDate"
                                            rules={[
                                                {
                                                    required: true,
                                                },
                                            ]}
                                        >
                                            <DatePicker format="DD-MM-YYYY"/>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col xs={24} sm={6}>
                                        <Form.Item
                                            label="Payment Means"
                                            name="payment_means"
                                            rules={[{required: true}]}
                                        >
                                            <Select
                                                placeholder="Select Payment Means"
                                                onChange={handlePaymentMeansChange}
                                                options={paymentMeansOptions.map((opt) => ({
                                                    value: opt.value,
                                                    label: (
                                                        <Tag color={opt.color} style={{marginRight: 0}}>
                                                            {opt.label}
                                                        </Tag>
                                                    ),
                                                }))}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={6}>
                                        <Form.Item
                                            label="Invoice Name"
                                            name="invoice_name"
                                            rules={[{required: true}]}
                                        >
                                            <Input
                                                placeholder="Enter invoice name"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>


                                <Form.Item
                                    label="Note"
                                    name="note"
                                    rules={[{required: false}]}

                                >
                                    <Input.TextArea
                                        placeholder="Enter notes here"
                                        autoSize={{minRows: 2, maxRows: 6}}
                                    />
                                </Form.Item>

                                <Divider style={{margin: 0}}/>
                                <div style={{padding: "32px"}}>
                                    <Typography.Title
                                        level={4}
                                        style={{marginBottom: "32px", fontWeight: 400}}
                                    >
                                        Items / Services
                                    </Typography.Title>
                                    <div className={styles.serviceTableWrapper}>
                                        <div className={styles.serviceTableContainer}>
                                            <Row className={styles.serviceHeader}>
                                                <Col
                                                    xs={{span: 7}}
                                                    className={styles.serviceHeaderColumn}
                                                >
                                                    Name
                                                    <Divider
                                                        type="vertical"
                                                        className={styles.serviceHeaderDivider}
                                                    />
                                                </Col>
                                                <Col
                                                    xs={{span: 5}}
                                                    className={styles.serviceHeaderColumn}
                                                >
                                                    Unit Price
                                                    <Divider
                                                        type="vertical"
                                                        className={styles.serviceHeaderDivider}
                                                    />
                                                </Col>
                                                <Col
                                                    xs={{span: 4}}
                                                    className={styles.serviceHeaderColumn}
                                                >
                                                    Quantity
                                                    <Divider
                                                        type="vertical"
                                                        className={styles.serviceHeaderDivider}
                                                    />
                                                </Col>
                                                <Col
                                                    xs={{span: 4}}
                                                    className={styles.serviceHeaderColumn}
                                                >
                                                    Discount
                                                    <Divider
                                                        type="vertical"
                                                        className={styles.serviceHeaderDivider}
                                                    />
                                                </Col>
                                                <Col
                                                    xs={{span: 3}}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "flex-end",
                                                    }}
                                                    className={styles.serviceHeaderColumn}
                                                >
                                                    Total Price
                                                </Col>
                                                <Col xs={{span: 1}}> </Col>
                                            </Row>
                                            <Row>
                                                {services.map((service, index) => {
                                                    return (
                                                        <Fragment key={index}>
                                                            <Col
                                                                xs={{span: 7}}
                                                                className={styles.serviceRowColumn}
                                                            >
                                                                <Select
                                                                    {...selectPropsInventory}
                                                                    placeholder="Name"
                                                                    style={{width: "100%"}}
                                                                    showSearch={true}
                                                                    filterOption={(input, option) =>
                                                                        (option?.label ?? "")
                                                                            .toString()
                                                                            .toLowerCase()
                                                                            .includes(input.toLowerCase())
                                                                    }
                                                                    optionLabelProp="label"
                                                                    options={inventoryData.map(item => ({
                                                                        label: `${item.item_code}- ${item.item_name}`,
                                                                        value: item._id,
                                                                    }))}
                                                                    onChange={(value) => {
                                                                        const selectedItem = inventoryData.find(item => item._id === String(value));
                                                                        if (selectedItem) {
                                                                            setServices((prev) =>
                                                                                prev.map((item, i) =>
                                                                                    i === index
                                                                                        ? {
                                                                                            ...item,
                                                                                            name: selectedItem.item_name,
                                                                                            unitPrice: selectedItem.selling_price,
                                                                                            item_discount_percentage: selectedItem.discount_rate,
                                                                                            item_code: selectedItem.item_code,
                                                                                            unitCode: selectedItem.unit,
                                                                                        }
                                                                                        : item
                                                                                )
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                            </Col>
                                                            <Col
                                                                xs={{span: 5}}
                                                                className={styles.serviceRowColumn}
                                                            >
                                                                <InputNumber
                                                                    addonBefore={selectedCurrencySymbol}
                                                                    style={{width: "100%"}}
                                                                    placeholder="Unit Price"
                                                                    min={0}
                                                                    precision={2}
                                                                    value={service.unitPrice}
                                                                    onChange={(value) => {
                                                                        handleServiceNumbersChange(
                                                                            index,
                                                                            "unitPrice",
                                                                            value || 0
                                                                        );
                                                                    }}
                                                                />
                                                            </Col>
                                                            <Col
                                                                xs={{span: 4}}
                                                                className={styles.serviceRowColumn}
                                                            >
                                                                <InputNumber
                                                                    style={{width: "100%"}}
                                                                    placeholder="Quantity"
                                                                    min={0}
                                                                    precision={2}
                                                                    value={service.quantity}
                                                                    onChange={(value) => {
                                                                        handleServiceNumbersChange(
                                                                            index,
                                                                            "quantity",
                                                                            value || 0
                                                                        );
                                                                    }}
                                                                />
                                                            </Col>
                                                            <Col
                                                                xs={{span: 4}}
                                                                className={styles.serviceRowColumn}
                                                            >
                                                                <InputNumber
                                                                    addonAfter="%"
                                                                    style={{width: "100%"}}
                                                                    placeholder="Discount Percentage"
                                                                    min={0}
                                                                    precision={2}
                                                                    max={100}
                                                                    value={service.item_discount_percentage}
                                                                    onChange={(value) => {
                                                                        handleServiceNumbersChange(
                                                                            index,
                                                                            "item_discount_percentage",
                                                                            value || 0
                                                                        );
                                                                    }}
                                                                />
                                                            </Col>
                                                            <Col
                                                                xs={{span: 3}}
                                                                className={styles.serviceRowColumn}
                                                                style={{
                                                                    justifyContent: "flex-end",
                                                                }}
                                                            >
                                                                <NumberField
                                                                    value={service.totalPrice}
                                                                    options={{
                                                                        style: "currency",
                                                                        currency: selectedCurrency,
                                                                    }}
                                                                />
                                                            </Col>
                                                            <Col
                                                                xs={{span: 1}}
                                                                className={styles.serviceRowColumn}
                                                                style={{
                                                                    paddingLeft: "0",
                                                                    justifyContent: "flex-end",
                                                                }}
                                                            >
                                                                <Button
                                                                    danger
                                                                    size="small"
                                                                    icon={<DeleteOutlined/>}
                                                                    onClick={() => {
                                                                        setServices((prev) =>
                                                                            prev.filter((_, i) => i !== index)
                                                                        );
                                                                    }}
                                                                />
                                                            </Col>
                                                        </Fragment>
                                                    );
                                                })}
                                            </Row>
                                            <Divider
                                                style={{
                                                    margin: "0",
                                                }}
                                            />
                                            <div style={{padding: "12px"}}>
                                                <Button
                                                    icon={<PlusCircleOutlined/>}
                                                    type="text"
                                                    className={styles.addNewServiceItemButton}
                                                    onClick={() => {
                                                        setServices((prev) => [
                                                            ...prev,
                                                            {
                                                                name: "",
                                                                unitPrice: 0,
                                                                unitCode: "PCE",
                                                                item_code: "",
                                                                quantity: 0,
                                                                price_without_discount: 0,
                                                                item_discount_percentage: 0,
                                                                item_discount_amount: 0,
                                                                totalPrice: 0,
                                                                description: "",
                                                            },
                                                        ]);
                                                    }}
                                                >
                                                    Add new item
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <Flex
                                        gap={16}
                                        vertical
                                        style={{
                                            marginLeft: "auto",
                                            marginTop: "24px",
                                            width: "220px",
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
                                                value={subtotal}
                                                options={{style: "currency", currency: selectedCurrency}}
                                            />
                                        </Flex>
                                        <Flex
                                            align="center"
                                            justify="space-between"
                                            style={{
                                                paddingLeft: 32,
                                            }}
                                        >
                                            <Typography.Text className={styles.labelTotal}>
                                                Tax:
                                            </Typography.Text>
                                            <InputNumber
                                                addonAfter="%"
                                                style={{width: "96px"}}
                                                value={tax}
                                                min={0}
                                                onChange={(value) => {
                                                    setTax(value || 15);
                                                }}
                                            />
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
                                                value={total}
                                                options={{style: "currency", currency: selectedCurrency}}
                                            />
                                        </Flex>
                                    </Flex>
                                </div>
                                <Divider style={{margin: 0}}/>
                                <Flex justify="end" gap={8} style={{padding: "32px"}}>
                                    <Button>Cancel</Button>
                                    <Button type="primary" htmlType="submit">
                                        Save
                                    </Button>
                                </Flex>
                            </Card>
                        </Flex>
                    </Form>
                </Show>
            )}
        </>
    );
};