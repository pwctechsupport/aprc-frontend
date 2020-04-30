import React, { useState } from "react";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import { useResourcesQuery } from "../../../generated/graphql";
import {
  SideBox,
  SideBoxItem,
  SideBoxItemText,
  SideBoxSearch,
  SideBoxTitle,
} from "../../../shared/components/SideBox";
import humanizeDate from "../../../shared/utils/humanizeDate";
import Tooltip from "../../../shared/components/Tooltip";
import Button from "../../../shared/components/Button";
import { Link } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import useAccessRights from "../../../shared/hooks/useAccessRights";

const ResourceSideBox = () => {
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebounce(search, 400);
  const [limit, setLimit] = useState(25);
  const onScroll = (e: any) => {
    const scroll =
      e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight;
    if (scroll === 0) {
      setLimit(limit + 25);
    }
  };
  const { data, loading } = useResourcesQuery({
    variables: { filter: { name_cont: searchQuery }, limit },
  });
  const resources = oc(data)
    .resources.collection([])
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  return (
    <SideBox onScroll={onScroll}>
      <SideBoxTitle>
        <div className="d-flex justify-content-between">
          {isAdmin || isAdminReviewer || isAdminPreparer
            ? "Resources Admin"
            : "Resources"}
          {isAdmin || isAdminPreparer ? (
            <Tooltip description="Create Resource">
              <Button
                tag={Link}
                to="/resources/create"
                className="soft red"
                color=""
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
        placeholder="Search Resources..."
        loading={loading}
      />
      {resources.map((resource) => (
        <SideBoxItem key={resource.id} to={`/resources/${resource.id}`}>
          <SideBoxItemText flex={2} bold>
            {resource.name}
          </SideBoxItemText>
          <SideBoxItemText style={{ fontSize: "15px" }} flex={1} right>
            {humanizeDate(new Date(resource.updatedAt))}
          </SideBoxItemText>
        </SideBoxItem>
      ))}
    </SideBox>
  );
};

export default ResourceSideBox;
