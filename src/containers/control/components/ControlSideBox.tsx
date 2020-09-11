import React, { useEffect, useState } from "react";
import { oc } from "ts-optchain";
import PickIcon from "../../../assets/Icons/PickIcon";
import { useControlsQuery } from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";
import {
  SideBox,
  SideBoxItem,
  SideBoxItemText,
  SideBoxSearch,
  SideBoxTitle,
} from "../../../shared/components/SideBox";
import Tooltip from "../../../shared/components/Tooltip";
// import humanizeDate from "../../../shared/utils/humanizeDate";
import useAccessRights from "../../../shared/hooks/useAccessRights";

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
    data?.navigatorControls?.collection.length === limit
      ? setCondition(true)
      : setCondition(false);
  }, [data, limit]);
  const controls = oc(data).navigatorControls.collection([]);

  return (
    <SideBox onScroll={onScroll}>
      <SideBoxTitle>
        <div className="d-flex justify-content-between">
          {isAdmin || isAdminPreparer || isAdminReviewer
            ? "Control admin"
            : "Control"}
        </div>
      </SideBoxTitle>
      <SideBoxSearch
        search={search}
        setSearch={setSearch}
        placeholder="Search controls..."
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
            {/* <SideBoxItemText style={{ fontSize: "15px" }} flex={1} right>
              {humanizeDate(oc(control).updatedAt(""))}
            </SideBoxItemText> */}
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
              <PickIcon name="reloadOrange" />
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
