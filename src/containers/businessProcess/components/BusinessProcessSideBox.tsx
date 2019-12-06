import React from "react";
import Input from "../../../shared/components/forms/Input";

const BusinessProcessSideBox = ({ searchValue, handleChange }: any) => {
  return (
    <aside>
      <div className="policy-side-box ">
        <Input
          placeholder="Search..."
          value={searchValue}
          onChange={handleChange}
        />
      </div>
    </aside>
  );
};

export default BusinessProcessSideBox;
