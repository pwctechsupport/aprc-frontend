import React from "react";
import { Input } from "reactstrap";

const ControlSideBox = ({
  searchValue,
  handleChange,
  placeholder = "Search..."
}: any) => {
  return (
    <aside>
      <div className="side-box">
        <div className="side-box__searchbar">
          <Input
            value={searchValue}
            onChange={handleChange}
            placeholder={placeholder}
            className="dark"
          />
        </div>
      </div>
    </aside>
  );
};

export default ControlSideBox;
