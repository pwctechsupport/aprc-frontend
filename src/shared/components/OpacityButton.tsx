import styled from "styled-components";

const OpacityButton = styled.button<{ isActive?: boolean }>`
  border: none;
  display: unset;
  margin-bottom: unset;
  padding: 5px;
  margin: 0px 4px;
  border-radius: 3px;
  transition: background 0.1s ease-out 0s;
  background: ${(p) => (p.isActive ? "#d3d3d3" : "var(--orange)")};
  color: ${(p) => (p.isActive ? "black" : "white")};
  &:hover {
    background-color: rgb(235, 236, 240);
  }
  &:focus,
  &:active {
    outline: none;
    border: none;
  }
`;

export default OpacityButton;
