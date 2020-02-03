import React, { useState } from "react";
import { Input } from "reactstrap";
import { Link } from "react-router-dom";
import classnames from "classnames";

const settingsMenus = [
  { label: "Profile", path: "/settings/update-profile" },
  { label: "Notifications", path: "/settings/notifications" },
  { label: "History", path: "/settings/history" },
  { label: "Bookmarks", path: "/settings/bookmarks" }
];

const SettingsSideBox = () => {
  return (
    <aside>
      <div className="side-box p-2">
        {settingsMenus.map(menu => (
          <Link className="side-box__item__title" to={menu.path}>
            {menu.label}
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default SettingsSideBox;
