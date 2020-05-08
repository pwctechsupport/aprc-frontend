import React, { useState, useEffect } from "react";
import { useRisksQuery } from "../../../generated/graphql";
import {
  SideBoxItem,
  SideBoxItemText,
  SideBoxSearch,
  SideBoxTitle,
  SideBox,
} from "../../../shared/components/SideBox";
import humanizeDate from "../../../shared/utils/humanizeDate";
import { useDebounce } from "use-debounce/lib";
import Tooltip from "../../../shared/components/Tooltip";
import Button from "../../../shared/components/Button";
import { Link } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import useAccessRights from "../../../shared/hooks/useAccessRights";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";

const RiskSideBox = () => {
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const [condition, setCondition] = useState(false);

  useEffect(() => {
    data?.risks?.collection.length === limit
      ? setCondition(true)
      : setCondition(false);
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [limit, setLimit] = useState(25);

  const { data, loading } = useRisksQuery({
    fetchPolicy: "network-only",
    variables: { filter: { name_cont: debouncedSearch }, limit },
  });
  const risks =
    data?.risks?.collection?.sort(
      (a, b) =>
        new Date(b.updatedAt || "").getTime() -
        new Date(a.updatedAt || "").getTime()
    ) || [];
  const onScroll = (e: any) => {
    const scroll =
      e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight;
    if (scroll === 0 && condition) {
      setLimit(limit + 25);
    }
  };
  return (
    <SideBox onScroll={onScroll}>
      <SideBoxTitle>
        <div className="d-flex justify-content-between">
          {isAdmin || isAdminReviewer || isAdminPreparer
            ? "Risk Admin"
            : "Risk"}
          {isAdmin || isAdminPreparer ? (
            <Tooltip description="Create Risk">
              <Button
                tag={Link}
                to="/risk/create"
                color=""
                className="soft red"
              >
                <FaPlus />
              </Button>
            </Tooltip>
          ) : null}
        </div>
      </SideBoxTitle>
      <SideBoxSearch
        search={search}
        setSearch={setSearch}
        placeholder="Search Risk..."
        loading={loading}
      />
      {risks.map((risk) => {
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
      {loading && (
        <div>
          <LoadingSpinner className="mt-2 mb-2" centered biggerSize />
        </div>
      )}
    </SideBox>
  );
};

export default RiskSideBox;
