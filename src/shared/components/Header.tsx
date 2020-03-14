import React from "react";
import styled from "styled-components";
import { Badge } from "reactstrap";

function Header({ heading = "", children, draft }: Header) {
  return (
    <Heading className="text-orange">
      {heading || children}
      {draft && (
        <span className="ml-2">
          <Badge>Draft</Badge>
        </span>
      )}
    </Heading>
  );
}

export default Header;

interface Header {
  heading?: string;
  children?: React.ReactNode;
  draft?: boolean;
}

const Heading = styled.div`
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
`;
