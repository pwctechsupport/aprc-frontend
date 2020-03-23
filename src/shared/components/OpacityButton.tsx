import styled from "styled-components";

const OpacityButton = styled.button`
  border: none;
  display: unset;
  margin-bottom: unset;
  padding: 5px;
  margin: 0px 4px;
  border-radius: 2px;
  transition: background 0.1s ease-out 0s;
  background: none rgb(244, 245, 247);
  &:hover {
    background-color: rgb(235, 236, 240);
  }
`;

export default OpacityButton;
