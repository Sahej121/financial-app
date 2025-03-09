import React from 'react';
import styled from 'styled-components';

const HintContainer = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  text-align: center;
  margin-top: 24px;

  kbd {
    background: rgba(255, 255, 255, 0.1);
    padding: 4px 8px;
    border-radius: 4px;
    margin: 0 4px;
  }
`;

const KeyboardHint = ({ shortcut, action }) => (
  <HintContainer>
    Press <kbd>{shortcut}</kbd> {action}
  </HintContainer>
);

export default KeyboardHint; 