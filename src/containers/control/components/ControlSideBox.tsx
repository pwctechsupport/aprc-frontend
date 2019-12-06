import React from "react";
import Input from "../../../shared/components/forms/Input";

const ControlSideBox = ({ searchValue, handleChange }: any) => {
  return (
    <aside>
      <div className="policy-side-box">
        <Input
          placeholder="search..."
          value={searchValue}
          onChange={handleChange}
        />
      </div>
    </aside>
  );
};

export default ControlSideBox;
