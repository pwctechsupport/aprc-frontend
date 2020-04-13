import React from "react";
import styled from "styled-components";
import { FaSearch, FaTimes } from "react-icons/fa";
import LoadingSpinner from "./LoadingSpinner";

interface SearchBarProps {
  search: string;
  setSearch: Function;
  placeholder?: string;
  loading?: boolean;
}

export default function SearchBar({
  search,
  placeholder,
  loading,
  setSearch,
}: SearchBarProps) {
  return (
    <SearchBarContainer>
      <SearchIcon />
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
      />
      <SearchInputLoadingIndicator>
        {loading && <LoadingSpinner />}
        {search && (
          <FaTimes
            className="clickable text-red"
            onClick={() => setSearch("")}
          />
        )}
      </SearchInputLoadingIndicator>
    </SearchBarContainer>
  );
}

const SearchBarContainer = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  margin-bottom: 20px;
  ::placeholder {
    color: grey;
  }
  padding: 16px 16px 16px 60px;
  border: none;
  background: rgba(0, 0, 0, 0.003);
  box-shadow: inset 0 -2px 0px rgba(0, 0, 0, 0.03);
  /* font-style: italic; */
  font-weight: 300;
  font-size: 15px;
  &:focus,
  &:active {
    outline: none;
    border: none;
    box-shadow: inset 0 -2px 0px var(--primary-color);
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 20px;
  top: 20px;
  color: grey;
`;

const SearchInputLoadingIndicator = styled.div`
  position: absolute;
  color: black;
  right: 14px;
  top: 16px;
`;
