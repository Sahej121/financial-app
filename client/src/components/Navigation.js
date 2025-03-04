import React from 'react';
import { Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const items = [
    { key: '/', label: <Link to="/">Home</Link> },
    { key: '/about', label: <Link to="/about">About</Link> },
    { key: '/services', label: <Link to="/services">Services</Link> },
    { key: '/contact', label: <Link to="/contact">Contact</Link> },
    { key: '/credit-card', label: <Link to="/credit-card">Credit Cards</Link> },
  ].filter(Boolean);

  return (
    <Menu
      theme="dark"
      mode="horizontal"
      selectedKeys={[location.pathname]}
      items={items}
    />
  );
};

export default Navigation; 