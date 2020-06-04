import React from "react";
import {
  SideBox,
  SideBoxItem,
  SideBoxItemText,
  SideBoxTitle,
} from "../../../shared/components/SideBox";

const settingsMenus = [
  { label: "Profile", path: "/settings/update-profile" },
  // { label: "Notifications", path: "/settings/notifications" },
  { label: "History", path: "/settings/history" },
  { label: "User Manual", path: "/settings/user-manual" },
];

const SettingsSideBox = () => {
  return (
    <SideBox>
      <SideBoxTitle>Menu</SideBoxTitle>
      {settingsMenus.map((menu) => (
        <SideBoxItem key={menu.path} to={menu.path}>
          <SideBoxItemText>{menu.label}</SideBoxItemText>
        </SideBoxItem>
      ))}
    </SideBox>
  );
};

export default SettingsSideBox;
