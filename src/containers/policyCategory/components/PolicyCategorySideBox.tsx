import React, { useState, Fragment, useEffect } from "react";
import { oc } from "ts-optchain";
import { usePolicyCategoriesQuery } from "../../../generated/graphql";
import {
  SideBox,
  SideBoxItem,
  SideBoxItemText,
  SideBoxSearch,
  SideBoxTitle,
} from "../../../shared/components/SideBox";
import Button from "../../../shared/components/Button";
import { FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import Tooltip from "../../../shared/components/Tooltip";
import useAccessRights from "../../../shared/hooks/useAccessRights";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";

const PolicyCategorySideBox = () => {
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState(false);

  const { data, loading } = usePolicyCategoriesQuery({
    variables: {
      filter: { name_cont: search },
      limit,
    },
    fetchPolicy: "network-only",
  });
  useEffect(() => {
    data?.policyCategories?.collection.length === limit
      ? setCondition(true)
      : setCondition(false);
  }, [data, limit]);
  const policyCategories = oc(data).policyCategories.collection([]);
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);

  const onScroll = (e: any) => {
    const scroll =
      e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight;

    if ((scroll === 0 || scroll < 0) && condition) {
      setLimit(limit + 25);
    }
  };

  return (
    <SideBox onScroll={onScroll}>
      <SideBoxTitle>
        <div className="d-flex justify-content-between">
          {isAdmin || isAdminReviewer || isAdminPreparer
            ? "Policy Category Admin"
            : "Policy Category"}
          {isAdminPreparer || isAdmin ? (
            <Tooltip description="Create Policy Category">
              <Button
                tag={Link}
                to="/policy-category/create"
                className="soft red"
                color=""
              >
                <FaPlus />
              </Button>
            </Tooltip>
          ) : null}
        </div>
      </SideBoxTitle>
      <SideBoxSearch search={search} setSearch={setSearch} loading={loading} />
      <Fragment>
        {policyCategories.map((policyCateg) => (
          <SideBoxItem
            key={policyCateg.id}
            to={`/policy-category/${policyCateg.id}`}
          >
            <SideBoxItemText bold>{policyCateg.name}</SideBoxItemText>
          </SideBoxItem>
        ))}
        {loading && (
          <div>
            <LoadingSpinner className="mt-2 mb-2" centered biggerSize />
          </div>
        )}
      </Fragment>
    </SideBox>
  );
};

export default PolicyCategorySideBox;
