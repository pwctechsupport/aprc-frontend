import React, { useState } from "react";
import { oc } from "ts-optchain";
import { useReferencesQuery } from "../../../generated/graphql";
import {
  SideBoxItem,
  SideBoxItemText,
  SideBoxSearch,
  SideBoxTitle,
  SideBox,
} from "../../../shared/components/SideBox";
import humanizeDate from "../../../shared/utils/humanizeDate";
import useAccessRights from "../../../shared/hooks/useAccessRights";
import Tooltip from "../../../shared/components/Tooltip";
import Button from "../../../shared/components/Button";
import { Link } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

const ReferenceSideBox = () => {
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(25);
  const onScroll = (e: any) => {
    const scroll = e.target.scrollHeight - e.target.scrollTop - 881;
    if (
      scroll === 0 ||
      scroll === 64 ||
      (scroll > 0 && scroll < 10) ||
      (scroll < 0 && scroll > -10)
    ) {
      setLimit(limit + 25);
    }
  };
  const { data, loading } = useReferencesQuery({
    fetchPolicy: "network-only",
    variables: { filter: { name_cont: search }, limit },
  });

  const references = oc(data)
    .references.collection([])
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  return (
    <SideBox onScroll={onScroll}>
      <SideBoxTitle>
        <div className="d-flex justify-content-between">
          {isAdmin || isAdminReviewer || isAdminPreparer
            ? "Policy Reference Admin"
            : "Policy Reference"}
          {(isAdmin || isAdminReviewer || isAdminPreparer) && (
            <Tooltip description="Create Policy">
              <Button
                tag={Link}
                to="/references/create"
                className="soft red"
                color=""
              >
                <FaPlus />
              </Button>
            </Tooltip>
          )}
        </div>
      </SideBoxTitle>
      <SideBoxSearch
        search={search}
        setSearch={setSearch}
        placeholder="Search Policy Reference..."
        loading={loading}
      />
      {references.map((reference) => {
        return (
          <SideBoxItem
            key={reference.id}
            to={`/references/${reference.id}`}
            activeClassName="active"
          >
            <SideBoxItemText flex={2} bold>
              {oc(reference).name("")
                ? oc(reference).name("")?.length > 60
                  ? oc(reference)
                      .name("")
                      ?.substring(0, 60) + "..."
                  : oc(reference).name("")
                : null}
            </SideBoxItemText>
            <SideBoxItemText style={{ fontSize: "15px" }} flex={1} right>
              {humanizeDate(oc(reference).updatedAt(""))}
            </SideBoxItemText>
          </SideBoxItem>
        );
      })}
    </SideBox>
  );
};

export default ReferenceSideBox;
