import React, { useState } from "react";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import { useResourcesQuery } from "../../../generated/graphql";
import {
  SideBox,
  SideBoxItem,
  SideBoxItemText,
  SideBoxSearch,
  SideBoxTitle
} from "../../../shared/components/SideBox";
import humanizeDate from "../../../shared/utils/humanizeDate";

const ResourceSideBox = () => {
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebounce(search, 400);
  const { data, loading } = useResourcesQuery({
    variables: { filter: { name_cont: searchQuery } }
  });
  const resources = oc(data)
    .resources.collection([])
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  return (
    <SideBox>
      <SideBoxTitle>Recently Added</SideBoxTitle>
      <SideBoxSearch
        search={search}
        setSearch={setSearch}
        placeholder="Search Resources..."
        loading={loading}
      />
      {resources.map(resource => (
        <SideBoxItem key={resource.id} to={`/resources/${resource.id}`}>
          <SideBoxItemText flex={2} bold>
            {resource.name}
          </SideBoxItemText>
          <SideBoxItemText flex={1} right>
            {humanizeDate(new Date(resource.updatedAt))}
          </SideBoxItemText>
        </SideBoxItem>
      ))}
    </SideBox>
  );
};

export default ResourceSideBox;
