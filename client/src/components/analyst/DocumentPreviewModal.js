import React, { useState, useEffect } from 'react';
import { Modal, Spin, Result, Button } from 'antd';
import { DownloadOutlined, CloseOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import api from '../../services/api';

const PreviewContainer = styled.div`
  width: 100%;
  height: 70vh;
  background: #1a1a1a;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const DocumentPreviewModal = ({ visible, onCancel, documentId, fileName, fileType }) => {
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (visible && documentId) {
            loadPreview();
        }
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, documentId]);

    const loadPreview = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get(`/documents/${documentId}/download`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: fileType || 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
        } catch (err) {
            console.error('Preview load error:', err);
            setError('Failed to load document preview. You may not have permission or the file is missing.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (previewUrl) {
            const link = document.createElement('a');
            link.href = previewUrl;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        }
    };

    const isImage = fileType?.startsWith('image/');
    const isPdf = fileType === 'application/pdf';

    return (
        <Modal
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '95%' }}>
                    <span style={{ color: 'white' }}>Document Preview: {fileName}</span>
                    <Button
                        type="primary"
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={handleDownload}
                        disabled={!previewUrl}
                        style={{ background: '#00B0F0' }}
                    >
                        Download
                    </Button>
                </div>
            }
            visible={visible}
            onCancel={onCancel}
            footer={null}
            width={1000}
            centered
            bodyStyle={{ padding: '20px', background: '#000' }}
            closeIcon={<CloseOutlined style={{ color: 'white' }} />}
        >
            <PreviewContainer>
                {loading ? (
                    <Spin size="large" tip="Loading highly secure preview..." />
                ) : error ? (
                    <Result
                        status="error"
                        title="Load Failed"
                        subTitle={error}
                    />
                ) : (
                    <>
                        {isImage ? (
                            <img
                                src={previewUrl}
                                alt={fileName}
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                        ) : isPdf ? (
                            <StyledIframe src={`${previewUrl}#toolbar=0`} title={fileName} />
                        ) : (
                            <Result
                                status="info"
                                title="Preview not available"
                                subTitle="This file type cannot be previewed directly. Please download to view."
                                extra={
                                    <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
                                        Download Now
                                    </Button>
                                }
                            />
                        )}
                    </>
                )}
            </PreviewContainer>
        </Modal>
    );
};

export default DocumentPreviewModal;
