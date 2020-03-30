import React, { useState } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

interface MenuProps {
  children: React.ReactNode;
  data?: MenuData[];
}

export interface MenuData {
  label: React.ReactNode;
  onClick?: Function;
}

export default function Menu({ children, data }: MenuProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dropdown isOpen={open} toggle={() => setOpen(p => !p)}>
      <DropdownToggle tag="div" className="clickable">
        {children}
      </DropdownToggle>
      <DropdownMenu right>
        {data?.map((item, index) => {
          if (item.label === "divider") {
            return <DropdownItem key={index} divider />;
          }
          return (
            <DropdownItem key={index} onClick={() => item.onClick?.()}>
              {item.label}
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
}
