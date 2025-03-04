import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Layout, Typography, Upload, Button, Modal, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { uploadDocument } from '../redux/slices/documentSlice';
import HeroSection from '../components/HeroSection';
import CAList from '../components/CAList';

const { Content } = Layout;
const { Title } = Typography;

const Home = () => {
  const dispatch = useDispatch();
  const { uploading, error } = useSelector((state) => state.documents);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);

  const handleUpload = async ({ file, onSuccess, onError }) => {
    try {
      await dispatch(uploadDocument(file)).unwrap();
      onSuccess("ok");
      message.success(`${file.name} file uploaded successfully`);
    } catch (err) {
      onError(err);
      message.error(`${file.name} file upload failed.`);
    }
  };

  const handleStartConsultation = () => {
    setIsModalVisible(true);
  };

  return (
    <Content>
      <HeroSection onStartConsultation={handleStartConsultation} />
      <CAList />
      
      <Modal
        title="Upload Documents"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Upload
          customRequest={handleUpload}
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          multiple
        >
          <Button icon={<UploadOutlined />} loading={uploading}>
            Select Files
          </Button>
        </Upload>
        {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
      </Modal>
    </Content>
  );
};

export default Home; 