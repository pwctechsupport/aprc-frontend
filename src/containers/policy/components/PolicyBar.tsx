import React from "react";
import styled from "styled-components";
import { capitalCase } from "capital-case";
import { Link } from "react-router-dom";

const PolicyBar = ({ id, title, category, status }: PolicyBarProps) => {
  return (
    <PolicyBarContainer to={`/policy/${id}`}>
      <div>{title}</div>
      <div>{category}</div>
      <div>{capitalCase(status || "")}</div>
    </PolicyBarContainer>
  );
};

const PolicyBarContainer = styled(Link)`
  background: white;
  padding: 0px 15px;
  box-shadow: inset 0 -1px 0 0 rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  height: 70px;
  color: inherit;
  &:hover {
    background: rgba(0, 0, 0, 0.08);
    text-decoration: none;
    color: inherit;
  }
`;

export default PolicyBar;

type PolicyBarProps = {
  id: string;
  title?: string | undefined | null;
  category?: string | undefined | null;
  status?: string | undefined | null;
};
