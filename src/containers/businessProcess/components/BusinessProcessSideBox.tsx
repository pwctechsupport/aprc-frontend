import React, { useState } from "react";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import { useBusinessProcessesQuery } from "../../../generated/graphql";
import {
  SideBox,
  SideBoxItem,
  SideBoxItemText,
  SideBoxSearch,
  SideBoxTitle,
} from "../../../shared/components/SideBox";
import humanizeDate from "../../../shared/utils/humanizeDate";
import useAccessRights from "../../../shared/hooks/useAccessRights";

const BusinessProcessSideBox = () => {
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const [searchValue, setSearchValue] = useState("");
  const [searchQuery] = useDebounce(searchValue, 400);
  const [limit, setLimit] = useState(25);
  const onScroll = (e: any) => {
    const test = e.target.scrollHeight - e.target.scrollTop - 881;
    if (test === 0 || test === 64) {
      setLimit(limit + 25);
    }
  };
  const { data, loading } = useBusinessProcessesQuery({
    variables: { filter: { name_cont: searchQuery }, limit },
  });
  const bps = oc(data)
    .businessProcesses.collection([])
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  return (
    <SideBox onScroll={onScroll}>
      <SideBoxTitle>
        {isAdmin || isAdminReviewer || isAdminPreparer
          ? "Business Process Admin"
          : "Business Process"}
      </SideBoxTitle>
      <SideBoxSearch
        search={searchValue}
        setSearch={setSearchValue}
        placeholder="Search BPs..."
        loading={loading}
      />
      <div>
        {bps.map((bp) => (
          <SideBoxItem key={bp.id} to={`/business-process/${bp.id}`}>
            <SideBoxItemText flex={2} bold>
              {bp.name}
            </SideBoxItemText>
            <SideBoxItemText style={{ fontSize: "15px" }} flex={1} right>
              {humanizeDate(bp.updatedAt)}
            </SideBoxItemText>
          </SideBoxItem>
        ))}
      </div>
    </SideBox>
  );
};

export default BusinessProcessSideBox;
