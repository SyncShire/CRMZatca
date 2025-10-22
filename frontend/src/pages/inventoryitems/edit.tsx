import {type HttpError, useNavigation} from "@refinedev/core";
import {Edit, useForm,} from "@refinedev/antd";
import {Col, Card, Form, Input, InputNumber, Row, Select, Skeleton, Tag, Typography} from "antd";
import type {InventoryItem} from "@/types";
import {useState} from "react";

export const InventoryItemsPageEdit = () => {
    const {listUrl} = useNavigation();

    const {formProps, query: queryResult, saveButtonProps} = useForm<
        InventoryItem,
        HttpError
    >({
        meta: {
            populate: ["inventoryitem"],
        },
    });

    const inventoryItem = queryResult?.data?.data;
    const isLoading = queryResult?.isLoading;


    const unitOfMeasureOptions = [
        {value: "PCE", label: "Piece", color: "orange"},
        {value: "KGM", label: "Kilogram", color: "cyan"},
        {value: "GRM", label: "gram", color: "green"},
        {value: "LTR", label: "Litre", color: "red"},
    ];
    const defaultMeasureOfUnit = "PCE";
    const [selectedMeasureOfUnit, setSelectedMeasureOfUnit] = useState(defaultMeasureOfUnit);

    const handleMeasureOfUnitChange = (value: React.SetStateAction<string>) => {
        let measureOfUnit = "";

        switch (value) {
            case "PCE":
                measureOfUnit = "PCE";
                break;
            case "KGM":
                measureOfUnit = "KGM";
                break;
            case "GRM":
                measureOfUnit = "GRM";
                break;
            case "LTR":
                measureOfUnit = "LTR";
                break;
            default:
                measureOfUnit = "PCE";
        }
        setSelectedMeasureOfUnit(measureOfUnit);
    };


    const itemOrServiceOptions = [
        {value: false, label: "Iterm/Product", color: "red"},
        {value: true, label: "Service", color: "cyan"},
    ];
    const [selectedItemOrService, setSelectedItemOrService] = useState(false);

    const handleItemOrServiceChange = (value: React.SetStateAction<boolean>) => {
        let itemOrService = false;

        switch (value) {
            case false:
                itemOrService = false;
                break;
            case true:
                itemOrService = true;
                break;
            default:
                itemOrService = false;
        }
        setSelectedItemOrService(itemOrService);
    };
    const defaultCurrencySymbol = "SAR";
    const userData = localStorage.getItem("user");
    let userId = "";
    if (userData) {
        const parsedUserData = JSON.parse(userData);
        userId = parsedUserData.userId;
    }

    return (
        <Edit
            title="Edit Invoice"
            saveButtonProps={{...saveButtonProps}}
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
            <Form
                {...formProps}
                initialValues={{
                    ...queryResult?.data?.data,
                    unit: inventoryItem?.unit,
                    item_type: inventoryItem?.is_service,
                }}
                onFinish={async (values) => {
                    return formProps.onFinish?.({
                        ...values,
                        userId: userId,
                    });
                }}
                layout="vertical"
            >

                <Card
                    bordered={false}
                    title={
                        <Typography.Text style={{fontWeight: 400}}>
                            {isLoading ? (
                                <Skeleton.Button style={{width: 100, height: 22}}/>
                            ) : (
                                `Item Code: ${inventoryItem?.item_code}`
                            )}
                        </Typography.Text>
                    }
                >
                    <Row gutter={16}>
                        <Col xs={24} sm={6}>
                            <Form.Item
                                name="item_name"
                                label="Item/Service Name"
                                rules={[{required: true}]}
                            >
                                <Input placeholder="Please enter Item or Service name"/>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={6}>
                            <Form.Item
                                name="category"
                                label="Category"
                                rules={[{required: true}]}
                            >
                                <Input placeholder="Please enter Category"/>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={6}>
                            <Form.Item
                                name="unit"
                                label="Unit"
                                rules={[{required: false}]}
                            >
                                <Select
                                    options={unitOfMeasureOptions.map((opt) => ({
                                        value: opt.value,
                                        label: (
                                            <Tag color={opt.color} style={{marginRight: 0}}>
                                                {opt.label}
                                            </Tag>
                                        ),
                                    }))}
                                    onChange={handleMeasureOfUnitChange}
                                    defaultValue={defaultMeasureOfUnit}
                                    placeholder="Please Select Measure of unit"/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Form.Item
                                name="is_service"
                                label="Item Type"
                                rules={[{required: true}]}
                            >
                                <Select
                                    options={itemOrServiceOptions.map((opt) => ({
                                        value: opt.value,
                                        label: (
                                            <Tag color={opt.color} style={{marginRight: 0}}>
                                                {opt.label}
                                            </Tag>
                                        ),
                                    }))}
                                    onChange={handleItemOrServiceChange}
                                    defaultValue={false}
                                    placeholder="Please Select if its an item or service"/>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24}>
                            <Form.Item
                                label="Description"
                                name="description"
                                rules={[{required: false}]}

                            >
                                <Input.TextArea
                                    placeholder="Enter Description here here"
                                    autoSize={{minRows: 2, maxRows: 6}}
                                />
                            </Form.Item>
                        </Col>
                    </Row>


                    <Row gutter={16}>
                        <Col xs={24} sm={6}>
                            <Form.Item
                                name="cost_price"
                                label="Cost Price/ Purchase Price"
                                rules={[{required: false}]}
                            >
                                <InputNumber
                                    addonBefore={defaultCurrencySymbol}
                                    precision={2}
                                    style={{width: "100%"}}
                                    placeholder="Please Cost Price "/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Form.Item
                                name="selling_price"
                                label="Selling Price"
                                rules={[{required: false}]}
                            >
                                <InputNumber
                                    addonBefore={defaultCurrencySymbol}
                                    precision={2}
                                    style={{width: "100%"}}
                                    placeholder="Please Selling Price"/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Form.Item
                                name="tax_rate"
                                label="Tax Rate in %"
                                rules={[{required: false}]}
                            >
                                <InputNumber
                                    addonBefore="%"
                                    precision={2}
                                    style={{width: "100%"}}
                                    placeholder="Enter tax rate on selling price"/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Form.Item
                                name="discount_rate"
                                label="Discount Rate in %"
                                rules={[{required: false}]}
                            >
                                <InputNumber
                                    addonBefore="%"
                                    precision={2}
                                    style={{width: "100%"}}
                                    placeholder="Enter discount rate on selling price"/>
                            </Form.Item>
                        </Col>
                    </Row>


                    <Row gutter={16}>
                        <Col xs={24} sm={7}>
                            <Form.Item
                                name="current_stock"
                                label="Number of units in stock or inventory"
                                rules={[{required: false}]}
                            >
                                <InputNumber
                                    precision={2}
                                    addonBefore={"Nos"}
                                    min={0}
                                    style={{width: "100%"}}
                                    placeholder="Please enter  units in stock"/>
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            </Form>
        </Edit>
    );
};
