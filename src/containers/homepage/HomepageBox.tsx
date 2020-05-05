import React, { useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Collapse } from "reactstrap";
import styled, { css } from "styled-components";
import EmptyAttribute from "../../shared/components/EmptyAttribute";
import { Suggestions } from "../../shared/formatter";

interface HomepageBoxProps {
  list: Suggestions;
  title?: string | null;
  basePath: string;
  boldColor?: string;
  softColor?: string;
  lineColor?: string;
}

export default function HomepageBox({
  list,
  title,
  basePath,
  boldColor,
  lineColor,
  softColor,
}: HomepageBoxProps) {
  const [open, setOpen] = useState(true);
  return (
    <div className="my-2">
      <div
        className="d-flex justify-content-between align-items-center"
        style={{ backgroundColor: "#eeeeee" }}
      >
        <h5
          style={{
            color: `${boldColor}`,
            marginTop: "3px",
            marginBottom: "3px",
            position: "relative",
            marginLeft: "3px",
          }}
        >
          {title}
        </h5>
        <BoxHeader onClick={() => setOpen((p) => !p)}>
          <Icon open={open} />
        </BoxHeader>
      </div>
      <Collapse
        style={{
          backgroundColor: `${softColor}`,
          borderTop: `5px solid ${boldColor}`,
        }}
        isOpen={open}
      >
        <div>
          {list.length ? (
            list.map((item) => (
              <StyledLink
                key={item.value}
                to={
                  basePath === "policy"
                    ? `/${basePath}/${item.value}/details`
                    : `/${basePath}/${item.value}`
                }
                className="d-flex align-items-center my-2"
                style={{
                  borderBottom: `1px solid ${lineColor}`,
                  color: `black`,
                }}
              >
                <div className="mr-3">
                  <Circle>{item.label.charAt(0).toUpperCase()}</Circle>
                </div>
                <StyledSpan>{item.label}</StyledSpan>
              </StyledLink>
            ))
          ) : (
            <EmptyAttribute>No {title}</EmptyAttribute>
          )}
        </div>
      </Collapse>
    </div>
  );
}

const StyledSpan = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledLink = styled(Link)`
  color: rgba(0, 0, 0, 0.5);
  font-size: larger;
  transition: 0.1s ease-in-out;
  &:hover {
    text-decoration: none;
    color: rgba(0, 0, 0, 0.8);
  }
  padding: 5px;
`;

const Circle = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 18px;
  color: #fff;
  text-align: center;
  background: rgba(0, 0, 0, 0.4);
  transition: 0.1s ease-in-out;
  ${StyledLink}:hover & {
    background: rgba(0, 0, 0, 0.8);
  }
`;

const BoxHeader = styled.div`
  padding: 5px 7px;
  cursor: pointer;
  border-radius: 5px;
  transition: 0.15s ease-in-out;
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const Icon = styled(FaCaretRight)<{ open: boolean }>`
  transition: 0.15s ease-in-out;
  ${(p: { open: boolean }) =>
    p.open &&
    css`
      transform: rotate(90deg);
    `};
`;
