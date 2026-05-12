import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Modal, Form, Input, Select, Space, Typography, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SyncOutlined, EyeOutlined } from '@ant-design/icons';
import { supabase } from '../../lib/supabase';
import { hasPermission } from '../../utils/helpers';
import { getCodeTypes, getCodesByType, loadCodeTables, refreshCodeTables, type CodeType, type CodeItem } from '../../utils/codeTable';
const { Title } = Typography;
const { TextArea } = Input;
export default function CodeTable() {
 const navigate = useNavigate();
 const [loading, setLoading] = useState(true);
 const [codeTypes, setCodeTypes] = useState<CodeType[]>([]);
 const [selectedType, setSelectedType] = useState<string>('');
 const [codes, setCodes] = useState<CodeItem[]>([]);
 const [modalVisible, setModalVisible] = useState(false);
 const [isEdit, setIsEdit] = useState(false);
 const [form] = Form.useForm();
 const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
 const [deleteItem, setDeleteItem] = useState<CodeItem | null>(null);
 // 权限检查
 if (!hasPermission('perm-admin-codes')) {
 return (<div className="flex items-center justify-center h-64">
 <Typography.Text type="danger">暂无权限访问码表管理</Typography.Text>
 </div>);
 }
 useEffect(() => {
 loadData();
 }, []);
 const loadData = async () => {
 try {
 setLoading(true);
 await loadCodeTables();
 const types = getCodeTypes();
 setCodeTypes(types);
 if (types.length > 0) {
 setSelectedType(types[0].id);
 setCodes(getCodesByType(types[0].id));
 }
 }
 catch (err) {
 console.error('加载失败:', err);
 message.error('加载数据失败');
 }
 finally {
 setLoading(false);
 }
 };
 const handleTypeChange = (typeId: string) => {
 setSelectedType(typeId);
 setCodes(getCodesByType(typeId));
 };
 const handleAdd = () => {
 setIsEdit(false);
 setModalVisible(true);
 form.resetFields();
 form.setFieldsValue({ type_id: selectedType });
 };
 const handleEdit = (record: CodeItem) => {
 setIsEdit(true);
 setModalVisible(true);
 form.setFieldsValue(record);
 };
 const handleDelete = (record: CodeItem) => {
 setDeleteItem(record);
 setDeleteConfirmVisible(true);
 };
 const handleSave = async () => {
 try {
 const values = await form.validateFields();
 if (isEdit) {
 // 更新
 const { error } = await supabase
 .from('sys_codes')
 .update({
 ...values,
 updated_at: new Date().toISOString()
 })
 .eq('id', values.id);
 if (error)
 throw error;
 message.success('更新成功');
 }
 else {
 // 新增
 const { error } = await supabase
 .from('sys_codes')
 .insert({
 ...values,
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString()
 });
 if (error)
 throw error;
 message.success('新增成功');
 }
 setModalVisible(false);
 await refreshCodeTables();
 setCodes(getCodesByType(selectedType));
 }
 catch (err) {
 console.error('保存失败:', err);
 message.error('保存失败');
 }
 };
 const handleDeleteConfirm = async () => {
 if (!deleteItem)
 return;
 try {
 const { error } = await supabase
 .from('sys_codes')
 .update({ status: 'inactive', updated_at: new Date().toISOString() })
 .eq('id', deleteItem.id);
 if (error)
 throw error;
 message.success('删除成功');
 setDeleteConfirmVisible(false);
 setDeleteItem(null);
 await refreshCodeTables();
 setCodes(getCodesByType(selectedType));
 }
 catch (err) {
 console.error('删除失败:', err);
 message.error('删除失败');
 }
 };
 const handleRefresh = () => {
 loadData();
 };
 const codeColumns = [
 { title: '码值编码', dataIndex: 'code', width: 150 },
 { title: '码值名称', dataIndex: 'name', width: 150 },
 { title: '描述', dataIndex: 'description', ellipsis: true },
 {
 title: '颜色',
 dataIndex: 'color',
 width: 100,
 render: (color: string) => color ? (<Tag color={color}>{color}</Tag>) : '-',
 },
 {
 title: '排序',
 dataIndex: 'sort_order',
 width: 80,
 },
 {
 title: '操作',
 key: 'action',
 width: 150,
 render: (_: unknown, record: CodeItem) => (<Space size="small">
 <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
 编辑
 </Button>
 <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
 删除
 </Button>
 </Space>),
 },
 ];
 return (<div className="space-y-4">
 <div className="flex items-center justify-between">
 <Title level={4}>码表管理</Title>
 <Button icon={<SyncOutlined />} onClick={handleRefresh} loading={loading}>
 刷新
 </Button>
 </div>

 {/* 码表类型选择 */}
 <Card>
 <div className="flex items-center gap-4">
 <span className="font-medium">选择码表类型：</span>
 <Select value={selectedType} onChange={handleTypeChange} style={{ width: 250 }} options={codeTypes.map(type => ({
 value: type.id,
 label: type.name,
 }))}/>
 <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
 新增码值
 </Button>
 </div>
 </Card>

 {/* 码值列表 */}
 <Card title={`${codeTypes.find(t => t.id === selectedType)?.name || ''} - 码值列表`}>
 <Table columns={codeColumns} dataSource={codes} rowKey="id" pagination={{ pageSize: 10 }} loading={loading}/>
 </Card>

 {/* 编辑/新增弹窗 */}
 <Modal title={isEdit ? '编辑码值' : '新增码值'} open={modalVisible} onOk={handleSave} onCancel={() => setModalVisible(false)}>
 <Form form={form} layout="vertical">
 <Form.Item name="id" hidden>
 <Input/>
 </Form.Item>
 <Form.Item name="type_id" hidden>
 <Input/>
 </Form.Item>
 <Form.Item name="code" label="码值编码" rules={[{ required: true, message: '请输入码值编码' }]}>
 <Input placeholder="如: normal"/>
 </Form.Item>
 <Form.Item name="name" label="码值名称" rules={[{ required: true, message: '请输入码值名称' }]}>
 <Input placeholder="如: 普通"/>
 </Form.Item>
 <Form.Item name="description" label="描述">
 <TextArea rows={3} placeholder="请输入描述信息"/>
 </Form.Item>
 <Form.Item name="color" label="颜色">
 <Select placeholder="选择颜色" options={[
 { value: 'default', label: '默认' },
 { value: 'red', label: '红色' },
 { value: 'orange', label: '橙色' },
 { value: 'green', label: '绿色' },
 { value: 'blue', label: '蓝色' },
 { value: 'purple', label: '紫色' },
 { value: 'cyan', label: '青色' },
 { value: 'gold', label: '金色' },
 { value: 'gray', label: '灰色' },
 { value: 'processing', label: '处理中' },
 { value: 'success', label: '成功' },
 ]}/>
 </Form.Item>
 <Form.Item name="sort_order" label="排序号">
 <Input type="number" defaultValue={0}/>
 </Form.Item>
 </Form>
 </Modal>

 {/* 删除确认弹窗 */}
 <Modal title="确认删除" open={deleteConfirmVisible} onOk={handleDeleteConfirm} onCancel={() => setDeleteConfirmVisible(false)}>
 <p>确定要删除码值 "{deleteItem?.name}" 吗？</p>
 </Modal>
 </div>);
}

