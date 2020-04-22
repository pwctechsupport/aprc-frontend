import React, { useState, Fragment } from "react";
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

const PolicyCategorySideBox = () => {
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState("");
  const { data, loading } = usePolicyCategoriesQuery({
    variables: {
      filter: { name_cont: search },
      limit,
    },
    fetchPolicy: "network-only",
  });
  const policyCategories = oc(data).policyCategories.collection([]);
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const admins = isAdmin || isAdminReviewer || isAdminPreparer;
  const onScroll = (e: any) => {
    const test = e.target.scrollHeight - e.target.scrollTop - 881;
    if (test === 0 || test === 64) {
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
          {admins ? (
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
      </Fragment>
    </SideBox>
  );
};

export default PolicyCategorySideBox;
