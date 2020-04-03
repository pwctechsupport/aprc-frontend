import React from "react";
import styled from "styled-components";
import { Badge } from "reactstrap";

function Header({ heading = "", children, draft, review }: Header) {
  return (
    <Heading className="text-orange">
      {heading || children}
      {draft && (
        <span className="ml-2">
          <Badge>Draft</Badge>
          {review ? (
            <Badge style={{ position: "relative", marginLeft: "5px" }}>
              Waiting For Review
            </Badge>
          ) : null}
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
  review?: boolean;
}

const Heading = styled.div`
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
`;
