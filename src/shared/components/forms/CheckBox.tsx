import React from "react";
import styled from "styled-components";
interface CheckboxInterface {
  checked?: boolean;
  onClick?: any;
  className?: string;
  style?: any;
}
const CheckBox = ({
  checked,
  onClick,
  className,
  style,
}: CheckboxInterface) => {
  return (
    <StyledCheckbox
      checked={checked}
      onClick={onClick}
      className={className}
      style={style}
    >
      <Icon viewBox="0 3 24 24">
        <polyline points="20 6 9 17 4 12" />
      </Icon>
    </StyledCheckbox>
  );
};
export default CheckBox;
const Icon = styled.svg`
  fill: none;
  stroke: white;
  stroke-width: 2px;
`;
interface Props {
  checked?: boolean;
}
const StyledCheckbox = styled.div<Props>`
  display: inline-block;
  width: 16px;
  cursor: pointer;
  height: 16px;
  background: ${(props) =>
    props.checked ? `var(--tangerine)` : "var(--soft-grey)"};
  border-radius: 3px;
  transition: all 150ms;

  ${Icon} {
    visibility: ${(props) => (props.checked ? "visible" : "hidden")};
  }
`;
