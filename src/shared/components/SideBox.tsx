import React from "react";
import { FaTimes } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { Input } from "reactstrap";
import styled from "styled-components";
import LoadingSpinner from "./LoadingSpinner";

export const SideBox = styled.div`
  background: #fff4ed;
  color: white;
  width: 330px;
  position: fixed;
  height: calc(100vh - 63px);
  overflow-y: scroll;
  z-index: 100;
  transition: 0.7s cubic-bezier(0.075, 0.82, 0.165, 1);

  @media (max-width: 900px) {
    width: 60px;
    &:hover {
      width: 330px;
      box-shadow: 0px 0px 50px 2px rgba(0, 0, 0, 0.38);
      -webkit-box-shadow: 0px 0px 50px 2px rgba(0, 0, 0, 0.38);
    }
  }

  @media (max-width: 320px) {
    width: 0px;
  }
`;

export const SideBoxTitle = styled.h4.attrs(() => ({
  className: "text-orange"
}))`
  padding: 1.5rem 1rem 0.5rem 1rem;
  text-overflow: ellipsis;
  overflow-x: hidden;
  overflow: hidden;
  white-space: nowrap;
`;

export const SideBoxSearch = ({
  search,
  setSearch,
  loading,
  placeholder
}: SideBoxSearchProps) => (
  <SideBoxSearchWrapper>
    <Input
      value={search}
      placeholder={placeholder || "Search..."}
      onChange={e => setSearch(e.target.value)}
      className="orange"
    />
    <SideBoxSearchLoadingIndicator>
      {loading && <LoadingSpinner />}
      {search && (
        <FaTimes className="clickable text-red" onClick={() => setSearch("")} />
      )}
    </SideBoxSearchLoadingIndicator>
  </SideBoxSearchWrapper>
);

interface SideBoxSearchProps {
  search: string;
  setSearch: Function;
  loading?: boolean;
  placeholder?: string;
}

const SideBoxSearchWrapper = styled.div`
  padding: 0px 1rem 20px 1rem;
  position: relative;
`;

const SideBoxSearchLoadingIndicator = styled.div`
  position: absolute;
  color: black;
  right: 1.5rem;
  top: 8px;
`;

export const SideBoxItem = styled(NavLink)`
  display: flex;
  justify-content: space-between;
  padding: 10px 1rem;
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

export const SideBoxItemText = styled.div<SideBoxItemTextProps>`
  flex: ${p => p.flex || 1};
  white-space: nowrap;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: ${p => (p.bold ? "bold" : "normal")};
  text-align: ${p => (p.right ? "right" : null)};
`;

interface SideBoxItemTextProps {
  flex?: number;
  bold?: boolean;
  right?: boolean;
}
