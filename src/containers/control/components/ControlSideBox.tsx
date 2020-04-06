import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
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

const ControlSideBox = () => {
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const [search, setSearch] = useState("");
  const { data, loading } = useControlsQuery({
    fetchPolicy: "network-only",
    variables: { filter: { description_cont: search } },
  });

  const controls = oc(data)
    .controls.collection([])
    .sort(
      (a, b) =>
        new Date(String(b.updatedAt)).getTime() -
        new Date(String(a.updatedAt)).getTime()
    );

  return (
    <SideBox>
      <SideBoxTitle>
        <div className="d-flex justify-content-between">
          {isAdmin || isAdminPreparer || isAdminReviewer
            ? "Control Admin"
            : "Control"}
          {isAdmin || isAdminReviewer || isAdminPreparer ? (
            <Tooltip description="Create Control">
              <Button
                tag={Link}
                to="/control/create"
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
              {oc(control).description("")}
            </SideBoxItemText>
            <SideBoxItemText style={{ fontSize: "15px" }} flex={1} right>
              {humanizeDate(oc(control).updatedAt(""))}
            </SideBoxItemText>
          </SideBoxItem>
        );
      })}
    </SideBox>
  );
};

export default ControlSideBox;
