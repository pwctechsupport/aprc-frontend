import styled from "styled-components";

const OpacityButton = styled.button`
  width: 100%;
  background-color: rgba(0, 0, 0, 0.01);
  text-align: center;
  cursor: pointer;
  padding: 7px 0;
  border-radius: 3px;
  transition: 0.15s ease-in-out;
  color: grey;
  &:hover {
    background: lightgrey;
    color: black;
  }
`;

export default OpacityButton;
