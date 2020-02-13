import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { Input } from "reactstrap";
import styled from "styled-components";
import { oc } from "ts-optchain";
import { useRisksQuery } from "../../../generated/graphql";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";
import humanizeDate from "../../../shared/utils/humanizeDate";

const RiskSideBox = () => {
  const [search, setSearch] = useState("");
  const { data, loading } = useRisksQuery({
    fetchPolicy: "network-only",
    variables: { filter: { name_cont: search } }
  });

  const risks = oc(data)
    .risks.collection([])
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  return (
    <div className="side-box">
      <SideBoxTitle>Recently Updated</SideBoxTitle>
      <SideBoxSearchWrapper>
        <Input
          value={search}
          placeholder="Search Policies..."
          onChange={e => setSearch(e.target.value)}
          className="orange"
        />
        <SideBoxSearchLoadingIndicator>
          {loading && <LoadingSpinner />}
          {search && (
            <FaTimes
              className="clickable text-red"
              onClick={() => setSearch("")}
            />
          )}
        </SideBoxSearchLoadingIndicator>
      </SideBoxSearchWrapper>
      {risks.map(risk => {
        return (
          <SideBoxItem
            key={risk.id}
            to={`/risk/${risk.id}`}
            activeClassName="active"
          >
            <SideBoxItemText flex={2} bold>
              {oc(risk).name("")}
            </SideBoxItemText>
            <SideBoxItemText flex={1} right>
              {humanizeDate(oc(risk).updatedAt(""))}
            </SideBoxItemText>
          </SideBoxItem>
        );
      })}
    </div>
  );
};

export default RiskSideBox;

const SideBoxTitle = styled.h4.attrs(() => ({ className: "text-orange" }))`
  padding: 20px 10px;
`;

const SideBoxSearchWrapper = styled.div`
  padding: 0px 10px 20px 10px;
  position: relative;
`;

const SideBoxSearchLoadingIndicator = styled.div`
  position: absolute;
  color: black;
  right: 18px;
  top: 8px;
`;

const SideBoxItem = styled(NavLink)`
  display: flex;
  justify-content: space-between;
  padding: 10px 10px;
  text-decoration: none;
  color: #f56409;
  &:hover {
    background: #f56409;
    opacity: 0.8;
    color: white;
    text-decoration: none;
    &.active {
      opacity: 1;
    }
  }
  &.active {
    background: #f56409;
    color: white;
  }
`;

const SideBoxItemText = styled.div<SideBoxItemTextProps>`
  flex: ${p => p.flex || 1};
  white-space: nowrap;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: ${p => (p.bold ? "bold" : "normal")};
  text-align: ${p => (p.right ? "right" : null)};
`;

interface SideBoxItemTextProps {
  flex: number;
  bold?: boolean;
  right?: boolean;
}
