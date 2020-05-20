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
import { FaUndo } from "react-icons/fa";
import useAccessRights from "../../../shared/hooks/useAccessRights";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";

const RiskSideBox = () => {
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const isUser = !(isAdmin || isAdminReviewer || isAdminPreparer);

  const [condition, setCondition] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [limit, setLimit] = useState(25);

  const { data, loading } = useRisksQuery({
    fetchPolicy: "network-only",
    variables: {
      filter: isUser
        ? { name_cont: debouncedSearch, draft_id_null: true }
        : isAdminReviewer
        ? { name_cont: debouncedSearch, draft_id_not_null: true }
        : { name_cont: debouncedSearch },
      limit,
    },
  });
  useEffect(() => {
    data?.navigatorRisks?.collection.length === limit
      ? setCondition(true)
      : setCondition(false);
  }, [data, limit]);
  const risks =
    data?.navigatorRisks?.collection?.sort(
      (a, b) =>
        new Date(b.updatedAt || "").getTime() -
        new Date(a.updatedAt || "").getTime()
    ) || [];
  const onScroll = (e: any) => {
    const scroll =
      e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight;
    if ((scroll === 0 || scroll < 0) && condition) {
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
      {!(risks.length < limit) && !loading && (
        <div className="text-center mt-2">
          <Tooltip description="refresh">
            <Button
              className="soft red "
              color=""
              onClick={() => setLimit(limit + 25)}
            >
              <FaUndo />
            </Button>
          </Tooltip>
        </div>
      )}
      {loading && (
        <div>
          <LoadingSpinner className="mt-2 mb-2" centered biggerSize />
        </div>
      )}
    </SideBox>
  );
};

export default RiskSideBox;
