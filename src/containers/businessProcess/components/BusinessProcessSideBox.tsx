import React, { useState } from "react";
import { Input } from "reactstrap";
import { useBusinessProcessesQuery } from "../../../generated/graphql";
import { oc } from "ts-optchain";
import { Link } from "react-router-dom";
import humanizeDate from "../../../shared/utils/humanizeDate";
import { useDebounce } from "use-debounce/lib";

const BusinessProcessSideBox = () => {
  const [searchValue, setSearchValue] = useState("");
  const [searchQuery] = useDebounce(searchValue, 700);

  const handleChange = (event: any) => {
    setSearchValue(event.target.value);
  };

  const { data } = useBusinessProcessesQuery({
    variables: { filter: { name_cont: searchQuery } }
  });
  const bps = oc(data)
    .businessProcesses.collection([])
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  return (
    <aside>
      <div className="side-box p-3">
        <Input
          placeholder="Search..."
          value={searchValue}
          onChange={handleChange}
          className="orange mb-3"
        />
        <h5 className="text-orange">Recently Added</h5>
        <div>
          {bps.map(bp => (
            <Link
              className="side-box__item text-white d-flex justify-content-between mt-2 py-1"
              to={`/business-process/${bp.id}`}
              key={bp.id}
            >
              <div className="text-orange">{bp.name}</div>
              <div className="text-orange">
                {humanizeDate(new Date(bp.updatedAt))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default BusinessProcessSideBox;
