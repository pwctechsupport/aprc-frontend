import classnames from "classnames";
import React from "react";
import { Link } from "react-router-dom";

const settingsMenus = [
  { label: "Profile", path: "/settings/update-profile" },
  { label: "Notifications", path: "/settings/notifications" },
  { label: "History", path: "/settings/history" },
  { label: "Bookmarks", path: "/settings/bookmarks" }
];

const SettingsSideBox = () => {
  return (
    <aside>
      <div className="side-box">
        {settingsMenus.map(menu => (
          <div className="side-box__list">
            <div
              className={classnames(
                "d-flex align-items-center side-box__item p-2"
              )}
            >
              <Link className="side-box__item__title" to={menu.path}>
                {menu.label}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SettingsSideBox;
