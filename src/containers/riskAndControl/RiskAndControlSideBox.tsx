import React, { useState } from "react";
import { useBusinessProcessesQuery } from "../../generated/graphql";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import Input from "../../shared/components/forms/Input";
import { Link } from "react-router-dom";

const RiskAndControlSideBox = () => {
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebounce(search, 700);

  const { data } = useBusinessProcessesQuery({
    variables: { filter: { name_cont: searchQuery } }
  });
  const bps = oc(data).businessProcesses.collection([]);

  return (
    <aside>
      <div className="side-box">
        <h4 className="pt-2 px-2">Business Processes</h4>
        <div className="side-box__searchbar mb-2">
          <Input
            value={search}
            placeholder="Search Business Process..."
            onChange={e => setSearch(e.target.value)}
            className="dark"
          />
        </div>
        <div className="pb-3">
          {bps.map(bp => (
            <Link to={`/risk-and-control/${bp.id}`} className="text-white">
              <div key={bp.id} className="side-box__item px-3 py-1">
                <div className="">{bp.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default RiskAndControlSideBox;
