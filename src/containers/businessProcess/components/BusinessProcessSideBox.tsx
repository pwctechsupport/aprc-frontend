import React from "react";
import { Input } from "reactstrap";

const BusinessProcessSideBox = ({ searchValue, handleChange }: any) => {
  return (
    <aside>
      <div className="side-box p-2">
        <Input
          placeholder="Search..."
          value={searchValue}
          onChange={handleChange}
          className="dark"
        />
      </div>
    </aside>
  );
};

export default BusinessProcessSideBox;
