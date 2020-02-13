import React, { useState } from "react";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import { useBusinessProcessesQuery } from "../../../generated/graphql";
import {
  SideBox,
  SideBoxItem,
  SideBoxItemText,
  SideBoxSearch,
  SideBoxTitle
} from "../../../shared/components/SideBox";
import humanizeDate from "../../../shared/utils/humanizeDate";

const BusinessProcessSideBox = () => {
  const [searchValue, setSearchValue] = useState("");
  const [searchQuery] = useDebounce(searchValue, 400);

  const { data, loading } = useBusinessProcessesQuery({
    variables: { filter: { name_cont: searchQuery } }
  });
  const bps = oc(data)
    .businessProcesses.collection([])
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  return (
    <SideBox>
      <SideBoxTitle>Recently Added</SideBoxTitle>
      <SideBoxSearch
        search={searchValue}
        setSearch={setSearchValue}
        placeholder="Search BPs..."
        loading={loading}
      />
      <div>
        {bps.map(bp => (
          <SideBoxItem key={bp.id} to={`/business-process/${bp.id}`}>
            <SideBoxItemText flex={2} bold>
              {bp.name}
            </SideBoxItemText>
            <SideBoxItemText flex={1} right>
              {humanizeDate(bp.updatedAt)}
            </SideBoxItemText>
          </SideBoxItem>
        ))}
      </div>
    </SideBox>
  );
};

export default BusinessProcessSideBox;
