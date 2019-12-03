import styled, { css } from "styled-components";

const Button = styled.button<{ primary?: boolean }>`
  display: inline-block;
  border-radius: 10px;
  width: 100%;
  height: 35px;
  background: palevioletred;
  color: white;
  border: 0;
  cursor: pointer;
  &:only-child {
    font-style: normal;
    font-weight: bold;
    font-size: 20px;
    line-height: 23px;
    display: flex;
    align-items: center;
    text-align: center;
    color: #ffffff;
  }
  ${props =>
    props.primary &&
    css`
      background: linear-gradient(180deg, #e3721c 0%, #c14303 100%);
    `}
`;

export default Button;
