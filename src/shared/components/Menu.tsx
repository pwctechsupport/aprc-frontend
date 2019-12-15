import React, { useState } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

const Menu = ({ children, data }: MenuProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Dropdown isOpen={open} toggle={() => setOpen(p => !p)}>
      <DropdownToggle tag="div" className="clickable">
        {children}
      </DropdownToggle>
      <DropdownMenu right>
        {Array.isArray(data) &&
          data.map((item, index) => {
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

export default Menu;

// Type definitions
interface MenuProps {
  children: React.ReactNode;
  data?: Array<MenuData>;
}

interface MenuData {
  label?: string | React.ReactNode;
  onClick?: () => void;
}
