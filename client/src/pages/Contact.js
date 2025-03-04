import React from 'react';
import { Typography, Form, Input, Button, Card, message } from 'antd';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const Contact = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Form values:', values);
    message.success('Thank you for your message. We will get back to you soon!');
    form.resetFields();
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
      <Title level={2}>Contact Us</Title>
      <Paragraph>
        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
      </Paragraph>

      <Card style={{ marginTop: '40px' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: 'Please enter your message' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Send Message
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Contact; 