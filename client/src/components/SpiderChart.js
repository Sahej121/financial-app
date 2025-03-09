import React from 'react';
import { Radar } from '@ant-design/plots';

const SpiderChart = () => {
  const data = [
    { name: 'Financial Planning', value: 80 },
    { name: 'Tax Advisory', value: 85 },
    { name: 'Business Growth', value: 75 },
    { name: 'Risk Management', value: 90 },
    { name: 'Investment Strategy', value: 85 },
  ];

  const config = {
    data: data.map((d) => ({ ...d })),
    xField: 'name',
    yField: 'value',
    appendPadding: [0, 10, 0, 10],
    meta: {
      value: {
        alias: 'Score',
        min: 0,
        max: 100,
      },
    },
    xAxis: {
      line: null,
      tickLine: null,
      grid: {
        line: {
          style: {
            lineDash: null,
          },
        },
      },
    },
    yAxis: {
      label: false,
      grid: {
        line: {
          type: 'line',
          style: {
            lineDash: null,
          },
        },
      },
    },
    point: {
      size: 2,
    },
    area: {},
  };

  return <Radar {...config} />;
};

export default SpiderChart; 