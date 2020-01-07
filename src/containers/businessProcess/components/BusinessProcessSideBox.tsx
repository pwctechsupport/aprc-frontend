import React from "react";
import { Input } from "reactstrap";
import { useBusinessProcessesQuery } from "../../../generated/graphql";
import { oc } from "ts-optchain";
import { Link } from "react-router-dom";
import humanizeDate from "../../../shared/utils/humanizeDate";

const BusinessProcessSideBox = ({ searchValue, handleChange }: any) => {
  const { data } = useBusinessProcessesQuery();
  const bps = oc(data)
    .businessProcesses.collection([])
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  return (
    <aside>
      <div className="side-box p-2">
        <Input
          placeholder="Search..."
          value={searchValue}
          onChange={handleChange}
          className="dark mb-3"
        />
        <h5>Recently Added</h5>
        <div>
          {bps.map(bp => (
            <Link
              className="side-box__item text-white d-flex justify-content-between mt-2 py-1"
              to={`/business-process/${bp.id}`}
              key={bp.id}
            >
              <div className="">{bp.name}</div>
              <div className="">{humanizeDate(new Date(bp.updatedAt))}</div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default BusinessProcessSideBox;
