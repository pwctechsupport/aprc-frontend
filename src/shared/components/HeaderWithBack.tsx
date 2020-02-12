import React from "react";
import styled from "styled-components";

function HeaderWithBackButton({ heading = "Heading" }) {
  return <Heading className="text-orange">{heading}</Heading>;
}

export default HeaderWithBackButton;

const Heading = styled.div`
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 20px;
`;
