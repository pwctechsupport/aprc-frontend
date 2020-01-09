import React, { useState } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import styled from "styled-components";

const Avatar = ({ data }: AvatarProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggle = () => setDropdownOpen(prevState => !prevState);

  return (
    <Dropdown isOpen={dropdownOpen} toggle={toggle}>
      <DropdownToggle tag="div">
        <AvatarIcon src="https://reactnativecode.com/wp-content/uploads/2018/01/2_img.png" />
      </DropdownToggle>
      <DropdownMenu>
        {data.map((item, index) => {
          if (item.header) {
            return (
              <DropdownItem header key={index} onClick={item.onClick}>
                {item.label}
              </DropdownItem>
            );
          }
          return (
            <DropdownItem key={index} onClick={item.onClick}>
              {item.label}
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
};

export default Avatar;

const AvatarIcon = styled.img`
  display: inline-block;
  position: relative;
  outline: 0px;
  height: 44px;
  width: 44px;
  border-radius: 50%;
  cursor: pointer;
`;

// -------------------------------------------------
// Type Definition
// -------------------------------------------------

interface DataType {
  onClick?: () => void;
  label: string | undefined;
  header?: boolean;
}

export interface AvatarProps {
  data: DataType[];
}
