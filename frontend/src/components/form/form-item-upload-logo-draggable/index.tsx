import { useEffect, useMemo, useState } from "react";
import { Button, Flex, Form, Upload, UploadFile, message, theme } from "antd";
import { CloudUploadOutlined, PictureOutlined } from "@ant-design/icons";
import type { RcFile, UploadChangeParam } from "antd/lib/upload";
import { useStyles } from "./styled";
import { file2Base64 } from "@refinedev/core";
import { getValueFromEvent } from "@refinedev/antd";
import { validateImageFile } from "@/components/form/helper";
const { Dragger } = Upload;

type Props = {
  name?: string;
  onFileChange?: (file: string | null) => void;
};

export const FormItemUploadLogoDraggable = ({
  name = "logo",
  onFileChange,
}: Props) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);

  const handleImageChange = async (info: UploadChangeParam) => {
    const { fileList: newFileList } = info;
    const latestFileList = newFileList.slice(-1); // Allow only one file in the list
    setFileList(latestFileList);

    // Ensure fileList has at least one file
    if (latestFileList.length > 0) {
      const file = latestFileList[0];
      const originFileObj = file.originFileObj;

      // Check if originFileObj is valid and is an instance of File
      if (originFileObj && originFileObj instanceof File) {
        try {
          const base64String = await file2Base64(file);
          setPreview(base64String);

          if (onFileChange) {
            onFileChange(base64String);
          }
        } catch (error) {
          console.error("Error converting file to base64:", error);
          message.error("Failed to convert the file to base64.");
        }
      } else {
        console.error("Invalid file object:", originFileObj);
        message.error("The selected file is invalid.");
      }
    } else {
      // Clear preview and reset file list if no file
      setPreview(null);
      if (onFileChange) {
        onFileChange(null);
      }
    }
  };

  const { styles } = useStyles();
  const { token } = theme.useToken();

  const form = Form.useFormInstance();

  return (
    <Flex gap={16} vertical>
      <div className={styles.container}>
        <Form.Item
          name="logo"
          valuePropName="fileList"
          noStyle
          getValueFromEvent={getValueFromEvent}
        >
          <Upload.Dragger
            name="file"
            listType="picture"
            accept="image/*"
            beforeUpload={() => false}
            multiple={false}
            showUploadList={false}
            style={{
              padding: 0,
            }}
            onChange={handleImageChange}
            fileList={fileList}
          >
            {preview && (
              <img
                src={preview}
                alt="preview"
                style={{
                  width: "148px",
                  height: "148px",
                  objectFit: "contain",
                }}
              />
            )}
            {!preview && (
              <PictureOutlined
                style={{
                  fontSize: "48px",
                  color: token.colorTextTertiary,
                }}
              />
            )}
          </Upload.Dragger>
        </Form.Item>
      </div>
      <Form.Item
        name="logo"
        valuePropName="fileList"
        getValueFromEvent={getValueFromEvent}
        // getValueProps={(data) => {
        //   return getValueProps(data, API_URL);
        // }}
        noStyle
      >
        <Upload
          name="files"
          listType="picture"
          accept="image/*"
          multiple={false}
          showUploadList={false}
          beforeUpload={() => false}
          onChange={handleImageChange}
          fileList={fileList}
        >
          <Button
            style={{
              width: "148px",
            }}
            icon={<CloudUploadOutlined />}
          >
            Upload Logo
          </Button>
        </Upload>
      </Form.Item>
    </Flex>
  );
};
