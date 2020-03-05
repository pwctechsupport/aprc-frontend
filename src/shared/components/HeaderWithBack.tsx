import React from "react";
import styled from "styled-components";

function HeaderWithBackButton({
  heading = "",
  children,
  flex
}: HeaderWithBackButtonProps) {
  return (
    <Heading className="text-orange" flex={flex}>
      {heading || children}
    </Heading>
  );
}

export default HeaderWithBackButton;

interface HeaderWithBackButtonProps {
  heading?: string;
  children?: React.ReactNode;
  flex?: boolean;
}

const Heading = styled.div<{ flex?: boolean }>`
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 20px;
  display: ${p => (p.flex ? "flex" : "block")};
  align-items: center;
`;
