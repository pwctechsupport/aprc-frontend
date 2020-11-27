import React, { useState } from "react";
import styled from "styled-components";
import Input from "./Input";
const CheckboxContainer = styled.div`
  display: inline-block;
  vertical-align: middle;
`;

const Icon = styled.svg`
  fill: none;
  stroke: white;
  stroke-width: 2px;
`;
interface Props {
  checked?: boolean;
}
const StyledCheckbox = styled.div<Props>`
  /* display: inline-block; */
  position: relative;
  bottom: 7px;
  width: 16px;
  height: 16px;
  background: ${(props) =>
    props.checked ? "var(--tangerine)" : "var(--soft-grey)"};
  border-radius: 3px;
  transition: all 150ms;
  ${Icon} {
    visibility: ${(props) => (props.checked ? "visible" : "hidden")};
  }
`;
interface CheckBoxProps {
  className?: string;
  name?: string;
  innerRef?: any;
  id?: string;
}
const CheckBox2 = ({
  className,
  name,
  innerRef,
  id,
  ...props
}: CheckBoxProps) => {
  const [checked, setChecked] = useState(false);
  return (
    <CheckboxContainer className={className} style={{ marginLeft: "-20px" }}>
      <Input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={() => {
          setChecked((p) => !p);
        }}
        innerRef={innerRef}
        {...props}
        style={{
          position: "absolute",
          left: "-7px",
          top: "7px",
          zIndex: 100,
          opacity: 0,
        }}
      />
      <StyledCheckbox checked={checked}>
        <Icon viewBox="0 3 24 24">
          <polyline points="20 6 9 17 4 12" />
        </Icon>
      </StyledCheckbox>
    </CheckboxContainer>
  );
};

export default CheckBox2;
