import React, { useState } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import styled from "styled-components";
import Button from "./Button";

const Avatar = ({ data }: AvatarProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggle = () => setDropdownOpen(prevState => !prevState);

  return (
    <Dropdown isOpen={dropdownOpen} toggle={toggle}>
      <DropdownToggle tag="div">
        <AvatarIcon src="https://reactnativecode.com/wp-content/uploads/2018/01/2_img.png" />
      </DropdownToggle>
      <DropdownMenu right className="dropdown__user mr-3 mt-3">
        {data.map((item, index) => (
          <div
            key={index}
            className="d-flex flex-column justify-content-center p-4"
          >
            <AvatarIcon src="https://reactnativecode.com/wp-content/uploads/2018/01/2_img.png" />
            <h4>Nama</h4>
            <Button onClick={item.onClick}>Log out</Button>
          </div>
        ))}
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
