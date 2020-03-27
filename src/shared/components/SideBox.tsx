import React from "react";
import { FaTimes, FaCaretRight } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { Input } from "reactstrap";
import styled, { css } from "styled-components";
import LoadingSpinner from "./LoadingSpinner";

// SideBox is the main wrapper to use side box.
export const SideBox = styled.div.attrs({ className: "d-none d-md-block" })`
  background: #fff4ed;
  /* color: white; */
  width: 25vw;
  position: fixed;
  height: calc(100vh - 63px);
  overflow-y: scroll;
  z-index: 100;
  transition: 0.7s cubic-bezier(0.075, 0.82, 0.165, 1);

  @media (max-width: 940px) {
    width: 20vw;
    &:hover {
      width: 50vw;
      box-shadow: 0px 0px 50px 2px rgba(0, 0, 0, 0.38);
      -webkit-box-shadow: 0px 0px 50px 2px rgba(0, 0, 0, 0.38);
    }
  }

  @media (max-width: 767px) {
    width: 0px;
  }
`;

// SideBoxTitle, the wrapper for the header. Better name should be SideBoxHeader.
export const SideBoxTitle = styled.h4.attrs(() => ({
  className: "text-orange"
}))`
  padding: 1.5rem 1rem 0.5rem 1rem;
  text-overflow: ellipsis;
  overflow-x: hidden;
  overflow: hidden;
  white-space: nowrap;
`;

// SideBoxSearch, handle the layout and input for search.
interface SideBoxSearchProps {
  search: string;
  setSearch: Function;
  loading?: boolean;
  placeholder?: string;
}

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

// SideBoxItem, the wrapper for rendering item in list, usually inside a map.
export const SideBoxItem = styled(NavLink)`
  display: flex;
  justify-content: space-between;
  padding: 10px 1rem;
  text-decoration: none;
  color: var(--primary-color);
  &:hover {
    background: var(--pale-primary-color);
    color: var(--primary-color);
    text-decoration: none;
  }
  &.active {
    background: var(--primary-color);
    color: white;
  }
`;

// SideBoxItemText, the actual component to render the text.
interface SideBoxItemTextProps {
  flex?: number;
  bold?: boolean;
  right?: boolean;
}

export const SideBoxItemText = styled.div<SideBoxItemTextProps>`
  flex: ${p => p.flex || 1};
  white-space: nowrap;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: ${p => (p.bold ? "bold" : "normal")};
  text-align: ${p => (p.right ? "right" : null)};
`;

// NOTE: Components named with 'branch' are for nested side box case.
//       For non nesting, use the above components instead.

// SideBoxBranch, the wrapper for rendering nested item in a list.
export const SideBoxBranch = styled.div`
  position: relative;
  &.active {
    background: var(--primary-color);
  }
  &:hover {
    background: var(--pale-primary-color);
    &.active {
      background: var(--primary-color);
    }
  }
`;

// SideBoxBranchTitle, the actual component that renders the text.
export const SideBoxBranchTitle = styled.div`
  padding: 10px 10px 10px 0px;
  text-decoration: none;
  width: 260px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--primary-color);
  font-weight: bold;
  &.active {
    color: white;
  }
  &:hover {
    text-decoration: none;
    color: var(--primary-color);
    &.active {
      color: white;
    }
  }
`;

// SideBoxBranchIconContainer, the container for the icon.
export const SideBoxBranchIconContainer = styled.div`
  color: white;
  padding: 10px;
  margin: 0;
  cursor: pointer;
  &:hover {
    background: rgba(245, 100, 9, 0.2);
  }
`;

// SideBoxBranchIcon, the actual animated icon.
export const SideBoxBranchIcon = styled(FaCaretRight)<{
  open: boolean;
}>`
  transition: 0.15s ease-in-out;
  ${(p: { open: boolean }) =>
    p.open &&
    css`
      transform: rotate(90deg);
    `};
`;
