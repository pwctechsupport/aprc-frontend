import React from "react";
import styled from "styled-components";
import { Badge } from "reactstrap";

function Header({ heading = "", children, draft, review, policy }: Header) {
  return (
    <Heading className="black">
      {heading || children}
      {draft && (
        <span className="ml-2">
          {policy && review ? (
            <Badge>Waiting For Review</Badge>
          ) : policy && !review ? (
            <Badge>Draft</Badge>
          ) : (
            <Badge>Waiting For Review</Badge>
          )}
        </span>
      )}
    </Heading>
  );
}

export default Header;

interface Header {
  heading?: string;
  policy?: boolean;
  children?: React.ReactNode;
  draft?: boolean;
  review?: boolean;
}

const Heading = styled.div`
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
`;
