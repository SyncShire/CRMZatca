import {type HttpError, useGo} from "@refinedev/core";
import {useForm} from "@refinedev/antd";
import {Col, DatePicker, Flex, Form, Input, InputNumber, Modal, Row, Select, Tag} from "antd";
import InputMask from "react-input-mask";
import type {InventoryItem} from "@/types";
import {useState} from "react";

export const InventoryItemsPageCreate = () => {
    const go = useGo();

    const {formProps, formLoading} = useForm<InventoryItem, HttpError>();
    const userData = localStorage.getItem("user");
    let userId = "";
    if (userData) {
        const parsedUserData = JSON.parse(userData);
        userId = parsedUserData.userId;
    }
    const defaultCurrencySymbol = "SAR";

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

    const defaultTaxRate = 15.00;
    return (
        <Modal
            width={"80%"}  // takes 80% of viewport
            style={{maxWidth: 1000}}
            okButtonProps={{form: "create-inventoryItem-form", htmlType: "submit"}}
            title="Add new Inventory Item"
            open
            onCancel={() => {
                go({
                    to: {resource: "inventoryitems", action: "list"},
                    options: {keepQuery: true},
                });
            }}
        >
            <Form
                layout="vertical"
                id="create-inventoryItem-form"
                {...formProps}
                initialValues={{
                    tax_rate: defaultTaxRate,
                    unit: defaultMeasureOfUnit,
                    is_service: false,
                }}
                onFinish={async (values) => {
                    return formProps.onFinish?.({
                        ...values,
                        userId,
                    });
                }}
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
                            rules={[{required: true}]}
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

            </Form>
        </Modal>
    );
};
