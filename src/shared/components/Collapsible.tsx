import React, { ReactNode, useState } from "react";
import { FaAngleRight } from "react-icons/fa";
import styled, { css } from "styled-components";

const Collapsible = ({
  title,
  children,
  show = true,
  onClick
}: CollapsibleProps) => {
  return (
    <div className="mb-2 py-3">
      <div className="clickable" onClick={() => onClick(title)}>
        <H5 open={show}>
          <Icon open={show} /> {title}
        </H5>
      </div>
      {show && children}
    </div>
  );
};

export default Collapsible;

export const UncontrolledCollapsible = ({
  title,
  children,
  initialState = true
}: UncontrolledCollapsibleProps) => {
  const [show, setShow] = useState(initialState);
  return (
    <div className="mb-3 py-3">
      <div className="clickable" onClick={() => setShow(p => !p)}>
        <H5 open={show}>
          <Icon open={show} /> {title}
        </H5>
      </div>
      {show && children}
    </div>
  );
};

//------------------------------------------------------------
// Building Blocks
//------------------------------------------------------------

const Icon = styled(FaAngleRight)<IconProps>`
  transition: 0.15s ease-in-out;
  color: grey;
  ${(p: IconProps) =>
    p.open &&
    css`
      transform: rotate(90deg);
      color: black;
    `};
`;

const H5 = styled.h5<IconProps>`
  transition: 0.15s ease-in-out;
  color: ${(p: IconProps) => (p.open ? "black" : "grey")};
`;

//------------------------------------------------------------
// Type Definitions
//------------------------------------------------------------

interface CollapsibleProps {
  title: string;
  children?: ReactNode;
  onClick: (title: string) => void;
  show: boolean;
}

interface UncontrolledCollapsibleProps {
  title?: string | null;
  children?: ReactNode;
  initialState?: boolean;
}

interface IconProps {
  open: boolean;
}
