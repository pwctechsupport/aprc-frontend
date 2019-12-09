import React from "react";
import { Input } from "reactstrap";

const ResourceSideBox = () => {
  // const
  return (
    <div className="policy-side-box">
      <Input
        placeholder="Search Policies..."
        // onChange={e => setSearch(e.target.value)}
        className="dark mb-3"
      />
      <div>{/* <PolicyTree /> */}</div>
    </div>
  );
};

export default ResourceSideBox;
