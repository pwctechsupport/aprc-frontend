import React, { useState, useEffect } from "react";
import { FaUndo } from "react-icons/fa";
import { oc } from "ts-optchain";
import { useControlsQuery } from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import {
  SideBox,
  SideBoxItem,
  SideBoxItemText,
  SideBoxSearch,
  SideBoxTitle,
} from "../../../shared/components/SideBox";
import Tooltip from "../../../shared/components/Tooltip";
import humanizeDate from "../../../shared/utils/humanizeDate";
import useAccessRights from "../../../shared/hooks/useAccessRights";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";

const ControlSideBox = () => {
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const [condition, setCondition] = useState(false);

  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(25);
  const onScroll = (e: any) => {
    const scroll =
      e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight;
    if ((scroll === 0 || scroll < 0) && condition) {
      setLimit(limit + 25);
    }
  };
  const isUser = !(isAdmin || isAdminReviewer || isAdminPreparer);

  const { data, loading } = useControlsQuery({
    fetchPolicy: "network-only",
    variables: {
      filter: isUser
        ? { draft_id_null: true, description_cont: search }
        : { description_cont: search },
      limit,
    },
  });
  useEffect(() => {
    data?.controls?.collection.length === limit
      ? setCondition(true)
      : setCondition(false);
  }, [data, limit]);
  const controls = oc(data)
    .controls.collection([])
    .sort(
      (a, b) =>
        new Date(String(b.updatedAt)).getTime() -
        new Date(String(a.updatedAt)).getTime()
    );

  return (
    <SideBox onScroll={onScroll}>
      <SideBoxTitle>
        <div className="d-flex justify-content-between">
          {isAdmin || isAdminPreparer || isAdminReviewer
            ? "Control Admin"
            : "Control"}
        </div>
      </SideBoxTitle>
      <SideBoxSearch
        search={search}
        setSearch={setSearch}
        placeholder="Search Controls..."
        loading={loading}
      />
      {controls.map((control) => {
        return (
          <SideBoxItem
            key={control.id}
            to={`/control/${control.id}`}
            activeClassName="active"
          >
            <SideBoxItemText flex={2} bold>
              {control.description}
            </SideBoxItemText>
            <SideBoxItemText style={{ fontSize: "15px" }} flex={1} right>
              {humanizeDate(oc(control).updatedAt(""))}
            </SideBoxItemText>
          </SideBoxItem>
        );
      })}
      {!(controls.length < limit) && !loading && (
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

export default ControlSideBox;
