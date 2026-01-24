import styled from 'styled-components';
import { Card } from 'antd';

// Premium Theme Colors referencing CSS variables for consistency
const colors = {
  background: 'var(--bg-primary)',
  cardBg: 'var(--bg-card)',
  primary: 'var(--primary-color)',
  secondary: 'var(--text-secondary)',
  accent: 'var(--secondary-color)',
  success: 'var(--success-color)',
  danger: 'var(--error-color)',
  text: 'var(--text-primary)',
  border: 'var(--border-color)'
};

export const DashboardContainer = styled.div`
  background-color: ${colors.background};
  min-height: 100vh;
  padding: 32px;
  color: ${colors.text};
  background-image: 
    radial-gradient(circle at 5% 5%, rgba(0, 176, 240, 0.03) 0%, transparent 20%),
    radial-gradient(circle at 95% 95%, rgba(242, 200, 17, 0.03) 0%, transparent 20%);
`;

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px; // Increased gap for airy feel
  margin-bottom: 24px;
`;

export const PowerBICard = styled(Card)`
  background: ${colors.cardBg} !important;
  border: 1px solid ${colors.border} !important;
  border-radius: 16px !important; // Softer corners
  backdrop-filter: blur(20px);
  color: ${colors.text};
  height: 100%;
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.4);
    border-color: rgba(255,255,255,0.15) !important;
  }
  
  .ant-card-head {
    border-bottom: 1px solid ${colors.border} !important;
    color: ${colors.text} !important;
    font-weight: 600;
    font-size: 16px;
    padding: 0 24px !important;
    min-height: 56px;
  }
  
  .ant-card-head-title {
    padding: 16px 0 !important;
  }
  
  .ant-card-body {
    padding: 24px !important;
  }
`;

export const KPICard = styled(PowerBICard)`
  text-align: left;
  position: relative;
  overflow: hidden;
  
  // Glowing accent line
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, ${props => props.color || colors.primary}, transparent);
    opacity: 0.5;
  }

  .kpi-title {
    color: var(--text-secondary);
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
    font-weight: 500;
  }

  .kpi-value {
    color: var(--text-primary);
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 8px;
    line-height: 1.2;
    letter-spacing: -1px;
  }

  .kpi-trend {
    font-size: 0.9rem;
    color: ${props => props.trend > 0 ? 'var(--success-color)' : props.trend < 0 ? 'var(--error-color)' : 'var(--text-secondary)'};
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
    background: rgba(0,0,0,0.2);
    display: inline-block;
    padding: 4px 10px;
    border-radius: 20px;
  }
`;

export const ChartContainer = styled(PowerBICard)`
  min-height: 420px;
  
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
`;

export const TableContainer = styled(PowerBICard)`
  .ant-table {
    background: transparent;
    color: ${colors.text};
  }
  
  .ant-table-thead > tr > th {
    background: rgba(255,255,255,0.02) !important;
    color: var(--text-secondary) !important;
    border-bottom: 1px solid ${colors.border};
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 1px;
  }
  
  .ant-table-tbody > tr > td {
    border-bottom: 1px solid ${colors.border};
    color: ${colors.text};
    padding: 16px !important;
  }

  .ant-table-tbody > tr:hover > td {
    background: rgba(255, 255, 255, 0.03) !important;
  }
  
  // Pagination Styling
  .ant-pagination-item {
    background: transparent;
    border-color: ${colors.border};
    a { color: ${colors.text}; }
  }
  .ant-pagination-item-active {
    border-color: ${colors.primary};
    a { color: ${colors.primary}; }
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  
  h1 {
    color: ${colors.text};
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, #fff 0%, #aaa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .actions {
    display: flex;
    gap: 16px;
  }
`;

export const ActionButton = styled.button`
  background: rgba(255,255,255,0.05);
  color: white;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 10px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255,255,255,0.1);
    border-color: white;
    transform: translateY(-1px);
  }
  
  svg {
    font-size: 16px;
  }
`;
