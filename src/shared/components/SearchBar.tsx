import React from "react";
import styled from "styled-components";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({ value, onChange, placeholder }: SearchBarProps) => {
  return (
    <SearchBarContainer>
      <SearchIcon />
      <Input value={value} onChange={onChange} placeholder={placeholder} />
    </SearchBarContainer>
  );
};

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
  box-shadow: inset 0 -2px 1px rgba(0, 0, 0, 0.03);
  font-style: italic;
  font-weight: 300;
  font-size: 15px;
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 20px;
  top: 20px;
  color: grey;
`;

interface SearchBarProps {
  value: string;
  onChange: (event: any) => void;
  placeholder?: string;
}

export default SearchBar;
