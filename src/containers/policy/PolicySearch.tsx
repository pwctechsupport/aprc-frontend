import React, { useState } from "react";
import { FaInfoCircle, FaSpinner } from "react-icons/fa";
import { Col, Container, Row, Collapse } from "reactstrap";
import { useSearchPoliciesQuery } from "../../generated/graphql";
import BreadCrumb from "../../shared/components/BreadCrumb";
import Pagination from "../../shared/components/Pagination";
import { SideBox, SideBoxTitle } from "../../shared/components/SideBox";
import {
  takeValue,
  removeEmpty,
  getParams,
  constructUrlParams,
} from "../../shared/formatter";
import useListState from "../../shared/hooks/useList";
import PolicySearchForm, {
  DateFilter,
  PolicySearchFormValues,
} from "./policySearch/PolicySearchForm";
import PolicySearchItem from "./policySearch/PolicySearchItem";
import OpacityButton from "../../shared/components/OpacityButton";
import { RouteComponentProps } from "react-router-dom";
import useAccessRights from "../../shared/hooks/useAccessRights";
import Footer from "../../shared/components/Footer";
import styled from "styled-components";

interface PolicySearchFilter {
  title_cont?: string;
  description_cont?: string;
  risks_id_in?: string[];
  controls_id_in?: string[];
  resources_id_in?: string[];
  references_id_in?: string[];
  policy_category_id_eq?: object;
  updated_at_gteq?: string | null;
}

export default function PolicySearch({
  location,
  history,
}: RouteComponentProps) {
  const defaultParams: PolicySearchFilter = getParams(location);
  const [filter, setFilter] = useState<PolicySearchFilter>(defaultParams);

  const [showDashboard, setShowDashboard] = useState(false);
  function toggleShowDashboard() {
    setShowDashboard((p) => !p);
  }

  const { limit, handlePageChange, page } = useListState({ limit: 10 });
  const { data, loading } = useSearchPoliciesQuery({
    variables: {
      filter,
      limit,
      page,
    },
  });
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const isUser = !(isAdmin || isAdminReviewer || isAdminPreparer);
  const policies = data?.policies?.collection || [];
  const totalCount = data?.policies?.metadata.totalCount || 0;
  function handleFormSubmit(values: PolicySearchFormValues) {
    const filter = isUser
      ? removeEmpty({
          title_cont: values.title,
          description_cont: values.description,
          risks_id_in: values.risks?.map(takeValue),
          controls_id_in: values.controls?.map(takeValue),
          resources_id_in: values.resources?.map(takeValue),
          references_id_in: values.policyReferences?.map(takeValue),
          policy_category_id_eq: values.policyCategories?.value,
          updated_at_gteq: constructDateFilter(values.dateFrom),
          status_eq: "release",
        })
      : removeEmpty({
          title_cont: values.title,
          description_cont: values.description,
          risks_id_in: values.risks?.map(takeValue),
          controls_id_in: values.controls?.map(takeValue),
          resources_id_in: values.resources?.map(takeValue),
          references_id_in: values.policyReferences?.map(takeValue),
          policy_category_id_eq: values.policyCategories?.value,
          updated_at_gteq: constructDateFilter(values.dateFrom),
        });
    setFilter(filter);
    history.replace(`?${constructUrlParams(filter)}`);
  }
  const defaultValues: PolicySearchFormValues = {
    title: filter.title_cont,
    description: filter.description_cont,
  };

  const filters = Object.entries(filter)
  return (
    <Container fluid className="p-0">
      <Row noGutters>
        <Col md={3}>
          <SideBox>
            <SideBoxTitle>
              <div className="d-flex justify-content-between">
                Search policies
              </div>
            </SideBoxTitle>
            <PolicySearchForm
              onSubmit={handleFormSubmit}
              submitting={loading}
              defaultValues={defaultValues}
            />
          </SideBox>
        </Col>
        <Col md={9} className="p-4">
          {/* <BreadCrumb crumbs={[["/policy", "Search policies"]]} /> */}
          <div style={{ minHeight: "80vh" }}>
            <div className="d-block d-md-none">
              <OpacityButton className="mb-1" onClick={toggleShowDashboard}>
                {showDashboard ? " Hide" : "Show"} Filter
              </OpacityButton>
              <Collapse isOpen={showDashboard}>
                <div className="py-3 bg-light rounded">
                  <PolicySearchForm
                    onSubmit={handleFormSubmit}
                    submitting={loading}
                    defaultValues={defaultValues}
                  />
                </div>
              </Collapse>
            </div>
            {filters.length === 0 || (filters[0][1] === "" && filters[1][1] === "" && filters.length === 2)  ? (
              <div>
                <BreadCrumb crumbs={[["/policy", "Search policies"]]} />
                <StyleH5>
                  <FaInfoCircle className="mr-3"/>
                  There were no results for your search</StyleH5>
              </div>
            ) :
            (
              <div>
                <Pagination
              totalCount={totalCount}
              perPage={limit}
              onPageChange={handlePageChange}
            />
            {isUser &&
            history.location.search.includes("status_eq=release") &&
            policies.length ? (
              policies.map((policy) => (
                <PolicySearchItem
                  key={policy.id}
                  policy={policy}
                  homepageSearch={"thisIsForSearchPolicy"}
                  filter={filter}
                />
              ))
            ) : !isUser && policies.length ? (
              policies.map((policy) => (
                <PolicySearchItem
                  key={policy.id}
                  policy={policy}
                  homepageSearch={"thisIsForSearchPolicy"}
                  filter={filter}
                />
              ))
            ) : loading ? (
              <div className={"text-center"}>
                <FaSpinner className="icon-spin" size={40} />
              </div>
            ) : (
              <div className="text-center p-2 text-orange">
                Policy not found
              </div>
            )}
              </div>
              
            )
            }
            
          </div>

          <Footer />
        </Col>
      </Row>
    </Container>
  );
}

// Construct 'dateFrom' to be in UTC
const aDay = 86400000;
const aWeek = 604800000;
const aMonth = 2592000000;
const threeMonths = 7776000000;
const aYear = 31536000000;

function constructDateFilter(input?: DateFilter): string | null {
  if (!input || input === "All Time") return null;
  const presentDate = new Date().getTime();
  const subtractor =
    input === "Today"
      ? aDay
      : input === "In 7 days"
      ? aWeek
      : input === "In a month"
      ? aMonth
      : input === "In 90 days"
      ? threeMonths
      : input === "In a year"
      ? aYear
      : 0;
  return new Date(presentDate - subtractor).toUTCString();
}

const StyleH5 = styled.h5`
  background: var(--soft-grey);
  padding: 15px 15px;
  margin-top: 50px;
  border-radius: 4px;
`
