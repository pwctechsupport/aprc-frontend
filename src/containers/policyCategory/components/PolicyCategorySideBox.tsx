import React, { useState } from "react";
import { oc } from "ts-optchain";
import { usePolicyCategoriesQuery } from "../../../generated/graphql";
import {
  SideBox,
  SideBoxItem,
  SideBoxItemText,
  SideBoxSearch,
  SideBoxTitle
} from "../../../shared/components/SideBox";
import Button from "../../../shared/components/Button";
import { FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import Tooltip from "../../../shared/components/Tooltip";

const PolicyCategorySideBox = () => {
  const [search, setSearch] = useState("");
  const { data, loading } = usePolicyCategoriesQuery({
    variables: {
      filter: { name_cont: search }
    },
    fetchPolicy: "network-only"
  });
  const policyCategories = oc(data).policyCategories.collection([]);

  return (
    <SideBox>
      <SideBoxTitle>
        <div className="d-flex justify-content-between">
          Recently Updated
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
        </div>
      </SideBoxTitle>
      <SideBoxSearch search={search} setSearch={setSearch} loading={loading} />
      {policyCategories.map(policyCateg => (
        <SideBoxItem
          key={policyCateg.id}
          to={`/policy-category/${policyCateg.id}`}
        >
          <SideBoxItemText>{policyCateg.name}</SideBoxItemText>
        </SideBoxItem>
      ))}
    </SideBox>
  );
};

export default PolicyCategorySideBox;