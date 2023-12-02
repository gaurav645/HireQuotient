import React, { useEffect, useState } from "react";
import { Table, Input, InputNumber, Form, Typography, Button } from "antd";
import axios from "../util/Api";
import { EditOutlined, DeleteTwoTone } from "@ant-design/icons";
const { Search } = Input;

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === "number" ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const EditableTable = () => {
  const [form] = Form.useForm();
  let [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const [filter, setFilter] = useState("");
  const [selectedData, setSelectedData] = useState([]);
  data =
    data &&
    data.filter((item) => {
      return Object.keys(item).some((key) =>
        item[key].toLowerCase().includes(filter)
      );
    });
  const removeId = (id) => {
    data = data.filter((item) => {
      return item.id !== id;
    });
    setData(data);
  };
  const removeSelected = () => {
    const idArray = selectedData.map((e) => e.id);
    data = data.filter((item) => {
      return !idArray.includes(item.id);
    });
    setData(data);
    setSelectedData([]);
  };
  const fetchData = async () => {
    try {
      let { data: dataList } = await axios.get(
        "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
      );
      dataList = dataList.map((item) => {
        var temp = Object.assign({}, item);
        temp.key = item.id;
        return temp;
      });
      setData(dataList);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      name: "",
      age: "",
      address: "",
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        setEditingKey("");
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      width: "50%",
      editable: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      width: "50%",
      editable: true,
    },
    {
      title: "Role",
      dataIndex: "role",
      width: "50%",
      editable: true,
    },
    {
      title: "operation",
      dataIndex: "operation",
      className: "operation",
      width: "50%",
      render: (_, record) => {
        const editable = isEditing(record);
        return (
          <div>
            {editable ? (
              <span>
                <button
                  onClick={() => save(record.key)}
                  style={{
                    marginRight: 8,
                  }}
                >
                  SAVE
                </button>
              </span>
            ) : (
              <>
                <Typography.Link
                  disabled={editingKey !== ""}
                  onClick={() => edit(record)}
                >
                  <EditOutlined className="edit" />
                </Typography.Link>
                <Typography.Link
                  disabled={editingKey !== ""}
                  onClick={() => removeId(record.id)}
                >
                  <DeleteTwoTone twoToneColor="#eb2796" className="delete" />
                </Typography.Link>
              </>
            )}
          </div>
        );
      },
    },
  ];
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows
      );
      setSelectedData(selectedRows);
    },
  };

  const onSearchChange = (e) => {
    setFilter(e.target.value);
  };
  return (
    <>
      <Search
        placeholder="Enter Value..."
        onChange={onSearchChange}
        className="search"
        style={{ width: '30%' }}
      />
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          rowSelection={{
            ...rowSelection,
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            onChange: cancel,
          }}
        />
        {selectedData.length > 0 && (
          <Button
            type="primary"
            danger
            className="delete"
            onClick={() => removeSelected()}
          >
            Delete Selected
          </Button>
        )}
      </Form>
    </>
  );
};

export default EditableTable;
