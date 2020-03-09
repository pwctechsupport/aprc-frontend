import React, { useState } from "react";
import { useRisksQuery } from "../../../generated/graphql";
import {
  SideBoxItem,
  SideBoxItemText,
  SideBoxSearch,
  SideBoxTitle,
  SideBox
} from "../../../shared/components/SideBox";
import humanizeDate from "../../../shared/utils/humanizeDate";
import { useDebounce } from "use-debounce/lib";
import Tooltip from "../../../shared/components/Tooltip";
import Button from "../../../shared/components/Button";
import { Link } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

const RiskSideBox = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const { data, loading } = useRisksQuery({
    fetchPolicy: "network-only",
    variables: { filter: { name_cont: debouncedSearch } }
  });

  const risks =
    data?.risks?.collection?.sort(
      (a, b) =>
        new Date(b.updatedAt || "").getTime() -
        new Date(a.updatedAt || "").getTime()
    ) || [];

  return (
    <SideBox>
      <SideBoxTitle>
        <div className="d-flex justify-content-between">
          Risk
          <Tooltip description="Create Risk">
            <Button tag={Link} to="/risk/create" color="" className="soft red">
              <FaPlus />
            </Button>
          </Tooltip>
        </div>
      </SideBoxTitle>
      <SideBoxSearch
        search={search}
        setSearch={setSearch}
        placeholder="Search Risk..."
        loading={loading}
      />
      {risks.map(risk => {
        return (
          <SideBoxItem
            key={risk.id}
            to={`/risk/${risk.id}`}
            activeClassName="active"
          >
            <SideBoxItemText flex={2} bold>
              {risk.name}
            </SideBoxItemText>
            <SideBoxItemText flex={1} right>
              {humanizeDate(risk.updatedAt || "")}
            </SideBoxItemText>
          </SideBoxItem>
        );
      })}
    </SideBox>
  );
};

export default RiskSideBox;
