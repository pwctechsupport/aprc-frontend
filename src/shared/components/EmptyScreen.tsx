import React, { ReactNode } from "react";
import styled from "styled-components";

const EmptyScreen = ({ children }: EmptyScreenProps) => {
  return (
    <EmptyScreenWrapper>{children || <h4>Select Data</h4>}</EmptyScreenWrapper>
  );
};

export default EmptyScreen;

const EmptyScreenWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

interface EmptyScreenProps {
  children: ReactNode;
}
