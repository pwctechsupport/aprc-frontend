import React, { useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Card, Collapse } from "reactstrap";
import styled, { css } from "styled-components";
import { Suggestions } from "../../shared/formatter";

interface HomepageBoxProps {
  list: Suggestions;
  title?: string | null;
  basePath: string;
}

export default function HomepageBox({
  list,
  title,
  basePath
}: HomepageBoxProps) {
  const [open, setOpen] = useState(true);
  return (
    <div className="my-2">
      <Card className="p-3 box-shadow">
        <div
          className="d-flex justify-content-between align-items-center"
          onClick={() => setOpen(p => !p)}
        >
          <h5>{title}</h5>
          <BoxHeader>
            <Icon open={open} />
          </BoxHeader>
        </div>
        <Collapse isOpen={open}>
          <div>
            {list.map(item => (
              <div key={item.value} className="d-flex align-items-center my-2">
                <div className="mr-3">
                  <Circle>{item.label.charAt(0).toUpperCase()}</Circle>
                </div>
                <Link to={`/${basePath}/${item.value}`}>{item.label}</Link>
              </div>
            ))}
          </div>
        </Collapse>
      </Card>
    </div>
  );
}

const Circle = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 18px;
  color: #fff;
  text-align: center;
  background: rgba(0, 0, 0, 0.4);
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
