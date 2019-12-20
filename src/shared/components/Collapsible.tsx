import cx from "classnames";
import React, { ReactNode, useState } from "react";
import { FaAngleRight } from "react-icons/fa";
import styled, { css } from "styled-components";

const Collapsible = ({
  title,
  children,
  small = true,
  initialState = true,
  withoutCard = false
}: CollapsibleProps) => {
  const [show, setShow] = useState(initialState);
  return (
    <div
      className={cx("mb-3 py-3", {
        "card-container": !withoutCard
      })}
    >
      <div className="clickable" onClick={() => setShow(!show)}>
        <H5 active={show}>
          <Icon active={show} /> {title}
        </H5>
      </div>
      {show && children}
    </div>
  );
};

export default Collapsible;

const Icon = styled(FaAngleRight)<IconProps>`
  transition: 0.15s ease-in-out;
  color: grey;
  ${props =>
    props.active &&
    css`
      transform: rotate(90deg);
      color: black;
    `};
`;

const H5 = styled.h5<IconProps>`
  transition: 0.15s ease-in-out;
  color: ${p => (p.active ? "black" : "grey")};
`;

interface IconProps {
  active?: boolean;
}

interface CollapsibleProps {
  title: string;
  withoutCard?: boolean;
  children?: ReactNode;
  small?: boolean;
  initialState?: boolean;
}
