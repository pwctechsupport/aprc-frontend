import React, { useState, useEffect } from "react";
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
import { FaUndo } from "react-icons/fa";
import useAccessRights from "../../../shared/hooks/useAccessRights";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";

const ResourceSideBox = () => {
  const [condition, setCondition] = useState(false);
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebounce(search, 400);
  const [limit, setLimit] = useState(25);
  const onScroll = (e: any) => {
    const scroll =
      e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight;
    if ((scroll === 0 || scroll < 0) && condition) {
      setLimit(limit + 25);
    }
  };
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const isUser = !(isAdmin || isAdminReviewer || isAdminPreparer);

  const { data, loading } = useResourcesQuery({
    variables: {
      filter: isUser
        ? { name_cont: searchQuery, draft_id_null: true }
        : isAdminReviewer
        ? { name_cont: searchQuery, draft_id_not_null: true }
        : { name_cont: searchQuery },
      limit,
    },
  });

  useEffect(() => {
    data?.navigatorResources?.collection.length === limit
      ? setCondition(true)
      : setCondition(false);
  }, [data, limit]);
  const resources = oc(data)
    .navigatorResources.collection([])
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  return (
    <SideBox onScroll={onScroll}>
      <SideBoxTitle>
        <div className="d-flex justify-content-between">
          {isAdmin || isAdminReviewer || isAdminPreparer
            ? "Resources Admin"
            : "Resources"}
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
      {!(resources.length < limit) && !loading && (
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

export default ResourceSideBox;
