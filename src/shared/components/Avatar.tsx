import React, { useState } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import AtlaskitAvatar from "@atlaskit/avatar";

const Avatar = ({ data }: AvatarProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggle = () => setDropdownOpen(prevState => !prevState);

  return (
    <Dropdown isOpen={dropdownOpen} toggle={toggle}>
      <DropdownToggle tag="div">
        <AtlaskitAvatar
          src="https://reactnativecode.com/wp-content/uploads/2018/01/2_img.png"
          presence="online"
          size="large"
        />
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
