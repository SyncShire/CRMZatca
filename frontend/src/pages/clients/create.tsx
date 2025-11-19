import {useGo, useOne} from "@refinedev/core";
import {useForm, useSelect} from "@refinedev/antd";
import {Form, Input, Modal, Select, Row, Col} from "antd";
import InputMask from "react-input-mask";
import type {Client} from "@/types";
import {useState} from "react";

export const ClientsPageCreate = () => {
    const go = useGo();

    const {formProps} = useForm<Client>();

    const getAccountData = async (accountId: string) => {
        return await useOne({
            resource: "accounts",
            id: accountId,
        });
    };

    const {selectProps: selectPropsAccount} = useSelect({
        resource: "accounts",
        optionLabel: "account_name",
        optionValue: "_id",
    });

    const defaultTaxType = "VAT";

    const taxOptions = [
        {value: "VAT", label: "VAT"},
    ];

    const handleTaxTypeChange = (value: React.SetStateAction<string>) => {
        let taxType = "";
        switch (value) {
            case "VAT":
                taxType = "taxType";
                break;
            default:
                taxType = defaultTaxType;
        }
        setSelectedTaxType(value);
    };

    const [selectedTaxType, setSelectedTaxType] = useState(
        defaultTaxType
    );

    const userData = localStorage.getItem("user");
    let userId = "";
    if (userData) {
        const parsedUserData = JSON.parse(userData);
        userId = parsedUserData.userId;
    }

    const defaultCountryIdentificationCode = "SA";

    return (
        <Modal
            width={"80%"}  // takes 80% of viewport
            style={{maxWidth: 1000}}
            okButtonProps={{form: "create-client-form", htmlType: "submit"}}
            title="Add new Customer"
            open
            onCancel={() => {
                go({
                    to: {resource: "clients", action: "list"},
                    options: {keepQuery: true},
                });
            }}
        >
            <Form
                layout="vertical"
                id="create-client-form"
                {...formProps}
                initialValues={{
                    partyTaxSchemeTaxSchemeId: defaultTaxType,
                    countryIdentificationCode: defaultCountryIdentificationCode,
                    status: "Active",
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
                            name="account"
                            label="Account"
                            rules={[{required: true}]}
                        >
                            <Select
                                {...selectPropsAccount}
                                placeholder="Please select an account"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={6}>
                        <Form.Item
                            name="partyLegalEntityRegistrationName"
                            label="Registered Customer Name"
                            rules={[{required: true}]}
                        >
                            <Input placeholder="Please enter Customer Name"/>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={6}>
                        <Form.Item
                            name="partyTaxSchemeCompanyID"
                            label="VAT Number"
                            rules={[{required: false}]}
                        >
                            <Input placeholder="Please enter VAT Number"/>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Form.Item
                            name="partyTaxSchemeTaxSchemeId"
                            label="Tax Type"
                            rules={[{required: false}]}
                        >
                            <Select
                                options={taxOptions}
                                onChange={handleTaxTypeChange}
                                defaultValue={defaultTaxType}
                                placeholder="Please Select Tax Type"/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col xs={24} sm={6}>
                        <Form.Item
                            name="streetName"
                            label="Street Name"
                            rules={[{required: false}]}
                        >
                            <Input placeholder="Please enter street name"/>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Form.Item
                            name="buildingNumber"
                            label="Building Number"
                            rules={[{required: false}]}
                        >
                            <Input placeholder="Please enter building no"/>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Form.Item
                            name="citySubdivisionName"
                            label="City SubDivision"
                            rules={[{required: false}]}
                        >
                            <Input placeholder="Please enter city subdivision"/>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Form.Item
                            name="cityName"
                            label="City"
                            rules={[{required: false}]}
                        >
                            <Input placeholder="Please city name"/>
                        </Form.Item>
                    </Col>
                </Row>


                <Row gutter={16}>
                    <Col xs={24} sm={6}>
                        <Form.Item
                            name="postalZone"
                            label="Postal Zone"
                            rules={[{required: false}]}
                        >
                            <Input placeholder="Please enter postal zone"/>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Form.Item
                            name="countryIdentificationCode"
                            label="Country Code"
                            rules={[{required: false}]}
                        >
                            <Input defaultValue={defaultCountryIdentificationCode}
                                   placeholder="Please enter country code"/>
                        </Form.Item>
                    </Col>


                    <Col xs={24} sm={6}>
                        <Form.Item
                            name="client_email"
                            label="Email"
                            rules={[{required: false, type: "email"}]}
                        >
                            <Input placeholder="Please enter email"/>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Form.Item
                            name="phoneNumber"
                            label="Phone"
                            rules={[{required: false}]}
                        >
                            <InputMask mask="(999) 999-9999">
                                {(props: any) => (
                                    <Input {...props} placeholder="Please enter phone number"/>
                                )}
                            </InputMask>
                        </Form.Item>
                    </Col>
                </Row>

            </Form>
        </Modal>
    );
};
