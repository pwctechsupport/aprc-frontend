import React from "react";
import { Input } from "reactstrap";

const BusinessProcessSideBox = ({ searchValue, handleChange }: any) => {
  return (
    <aside>
      <div className="policy-side-box ">
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
