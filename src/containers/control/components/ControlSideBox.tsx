import React from "react";
import { Input } from "reactstrap";

const ControlSideBox = ({
  searchValue,
  handleChange,
  placeholder = "Search..."
}: any) => {
  return (
    <aside>
      <div className="policy-side-box">
        <Input
          value={searchValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="dark"
        />
      </div>
    </aside>
  );
};

export default ControlSideBox;
