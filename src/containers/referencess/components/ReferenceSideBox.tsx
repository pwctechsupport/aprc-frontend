import React, { useState } from "react";
import { oc } from "ts-optchain";
import { useReferencesQuery } from "../../../generated/graphql";
import {
  SideBoxItem,
  SideBoxItemText,
  SideBoxSearch,
  SideBoxTitle,
  SideBox
} from "../../../shared/components/SideBox";
import humanizeDate from "../../../shared/utils/humanizeDate";
import useAccessRights from "../../../shared/hooks/useAccessRights";

const ReferenceSideBox = () => {
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer"
  ]);
  const [search, setSearch] = useState("");
  const { data, loading } = useReferencesQuery({
    fetchPolicy: "network-only",
    variables: { filter: { name_cont: search } }
  });

  const references = oc(data)
    .references.collection([])
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  return (
    <SideBox>
      <SideBoxTitle>
        {isAdmin || isAdminReviewer || isAdminPreparer
          ? "Policy Reference Admin"
          : "Policy Reference"}
      </SideBoxTitle>
      <SideBoxSearch
        search={search}
        setSearch={setSearch}
        placeholder="Search Policy Reference..."
        loading={loading}
      />
      {references.map(reference => {
        return (
          <SideBoxItem
            key={reference.id}
            to={`/references/${reference.id}`}
            activeClassName="active"
          >
            <SideBoxItemText flex={2} bold>
              {oc(reference).name("")}
            </SideBoxItemText>
            <SideBoxItemText flex={1} right>
              {humanizeDate(oc(reference).updatedAt(""))}
            </SideBoxItemText>
          </SideBoxItem>
        );
      })}
    </SideBox>
  );
};

export default ReferenceSideBox;
