import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { logout } from '../redux/slices/userSlice';

const { Header } = Layout;

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">Profile</Link>
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Header>
      <div className="logo" />
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['/']}>
        <Menu.Item key="/">
          <Link to="/">Home</Link>
        </Menu.Item>
        <Menu.Item key="/about">
          <Link to="/about">About</Link>
        </Menu.Item>
        <Menu.Item key="/services">
          <Link to="/services">Services</Link>
        </Menu.Item>
        <Menu.Item key="/ca-selection">
          <Link to="/ca-selection">CA Selection</Link>
        </Menu.Item>
        <Menu.Item key="/credit-card">
          <Link to="/credit-card">Credit Card</Link>
        </Menu.Item>
        <Menu.Item key="/planning">  {/* Added Planning option */}
          <Link to="/planning">Planning</Link>
        </Menu.Item>
        <Menu.Item key="/contact">
          <Link to="/contact">Contact</Link>
        </Menu.Item>

        {user ? (
          <Menu.Item key="user" style={{ marginLeft: 'auto' }}>
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Button type="text" style={{ color: '#fff' }}>
                <UserOutlined /> {user.name}
              </Button>
            </Dropdown>
          </Menu.Item>
        ) : (
          <>
            <Menu.Item key="login" style={{ marginLeft: 'auto' }}>
              <Link to="/login">Login</Link>
            </Menu.Item>
            <Menu.Item key="register">
              <Link to="/register">Register</Link>
            </Menu.Item>
          </>
        )}
      </Menu>
    </Header>
  );
};

export default Navbar;
