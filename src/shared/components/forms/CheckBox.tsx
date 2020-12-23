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
      <Icon viewBox="0 0 24 24">
        <Polyline />
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

export const Polyline = styled.polyline.attrs({ points: "5,9 10,14 20,4" })`
  /* transform: translateY(-3px); */
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
  transform: translateY(1px); //dirty
  vertical-align: top;

  ${Icon} {
    visibility: ${(props) => (props.checked ? "visible" : "hidden")};
  }

  .form-check & + label {
    width: 94%;
  }
`;
