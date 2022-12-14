import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Policy, usePreparerPoliciesQuery } from "../../../generated/graphql";
// import EmptyAttribute from "../../../shared/components/EmptyAttribute";
import { previewHtml } from "../../../shared/formatter";
import DateHover from "../../../shared/components/DateHover";
import { Row, Col} from "reactstrap";
import { FaSpinner } from "react-icons/fa";
import BreadCrumb, { CrumbItem } from "../../../shared/components/BreadCrumb";
import { PWCLink } from "../../../shared/components/PoliciesTable";
import { Badge } from "../../../shared/components/Badge";

interface PolicySearchItemProps {
  policy: Omit<Policy, "createdAt">;
  homepageSearch: string;
  filter: any;
}
export default function PolicySearchItem({
  filter = {},
  policy,
  homepageSearch,
}: PolicySearchItemProps) {
  const {
    id,
    title,
    description,
    risks,
    controls,
    resources,
    references,
    updatedAt,
  } = policy;
  const ancestry = policy?.ancestry?.split("/") || [];
  const { data, loading } = usePreparerPoliciesQuery({
    skip: ancestry.length ? false : true,
    variables: { isTree: false, filter: { id_matches_any: ancestry } },
  });

  const parentTitle = data?.preparerPolicies?.collection || [];
  const sortedParentTitle = parentTitle.sort((a: any, b: any) => {
    return a.id > b.id ? 1 : b.id > a.id ? -1 : 0;
  });
  const showResource = resources?.map((a) =>
    a.name?.toLowerCase().includes(homepageSearch.toLowerCase())
  );
  const showReference = references?.map((a) =>
    a.name?.toLowerCase().includes(homepageSearch.toLowerCase())
  );
  const showControl = controls?.map((a) =>
    a.description?.toLowerCase().includes(homepageSearch.toLowerCase())
  );
  const showRisk = risks?.map((a) =>
    a.name?.toLowerCase().includes(homepageSearch.toLowerCase())
  );
  const risksPolicy = policy.risks;
  const referencesPolicy = policy.references;
  const resourcesPolicy = policy.resources;
  const controlsPolicy = policy.controls;
  const polcatPolicy = policy.policyCategory;
  const breadcrumb = sortedParentTitle
    .map((a: any) => ["/policy/" + a.id, a.title])
    .concat([["/policy/" + policy.id, policy.title || ""]]) as CrumbItem[];

  return (
    <Fragment>
      {/* homepageSearchs is a string for search */}
      <PolicySearchItemContainerMini>
        <Row>
          <StyledLink to={`/policy/${id}/details`}>
            <div className="ml-2">
              <StyledTitle>
                <strong>{title}</strong>
              </StyledTitle>
            </div>
            <div className="mb-2 ml-2">
              <DateHover humanize={false} withIcon>{updatedAt}</DateHover>
            </div>
            <div className="text-secondary ml-2 text-justify">
              {(description
                ?.toLowerCase()
                .includes(homepageSearch.toLowerCase()) &&
                previewHtml(description || "")) ||
                (description?.toLowerCase().includes(filter.description_cont) &&
                  filter.description_cont !== "" &&
                  previewHtml(description || ""))}
            </div>
          </StyledLink>
        </Row>

        {/* Referencess */}

        <Row className="mt-1">
          {!showReference?.every((a) => a === false) &&
          homepageSearch !== "" ? (
            <Col sm={12}>
              {references?.map(
                (reference) =>
                  reference?.name
                    ?.toLowerCase()
                    .includes(homepageSearch.toLowerCase()) && (
                    <Fragment>
                      <Link to={`/policy/${id}/details/#references`}>
                        <Badge className="mx-1" key={reference.id}>
                          {reference.name}
                        </Badge>
                      </Link>
                    </Fragment>
                  )
              )}
            </Col>
          ) : referencesPolicy?.filter((ref) =>
              filter.references_id_in?.includes(ref.id)
            ).length ? (
            <Col sm={12}>
              {referencesPolicy?.map((reference) => (
                <PWCLink to={`/policy/${id}/details/#references`}>
                  <Badge className="mx-1" key={reference.id}>
                    {reference.name}
                  </Badge>
                </PWCLink>
              ))}
            </Col>
          ) : null}
        </Row>

        <Row>
          {/* Resourcess */}

          {(!showResource?.every((a) => a === false) &&
            homepageSearch !== "" && (
              <Col sm={12}>
                <StyledLi>
                  <Names>Resources:</Names>
                  <ul>
                    {resources?.map(
                      (resource) =>
                        resource?.name
                          ?.toLowerCase()
                          .includes(homepageSearch.toLowerCase()) && (
                          <li>
                            <StyledTdMini key={resource.id}>
                              <PWCLink to={`/policy/${id}/resources`}>
                                {resource.name}
                              </PWCLink>
                            </StyledTdMini>
                          </li>
                        )
                    )}
                  </ul>
                </StyledLi>
              </Col>
            )) ||
            (resourcesPolicy?.filter((res) =>
              filter.resources_id_in?.includes(res.id)
            ) &&
              resourcesPolicy?.filter((res) =>
                filter.resources_id_in?.includes(res.id)
              ).length !== 0 && (
                <Col sm={12}>
                  <StyledLi>
                    <Names>Resources:</Names>
                    <ul>
                      {resourcesPolicy?.map((resource) => (
                        <li>
                          <StyledTdMini key={resource.id}>
                            <PWCLink to={`/policy/${id}/details/#references`}>
                              {resource.name}
                            </PWCLink>
                          </StyledTdMini>
                        </li>
                      ))}
                    </ul>
                  </StyledLi>
                </Col>
              ))}

          {/* Riskss */}

          {(!showRisk?.every((a) => a === false) && homepageSearch !== "" && (
            <Col sm={12}>
              <StyledLi>
                <Names>Risks:</Names>
                <ul>
                  {risks?.map(
                    (risk) =>
                      risk?.name
                        ?.toLowerCase()
                        .includes(homepageSearch.toLowerCase()) && (
                        <li>
                          <StyledTdMini key={risk.id}>
                            <PWCLink to={`/policy/${id}/details/#risks`}>
                              {risk.name}
                            </PWCLink>
                          </StyledTdMini>
                        </li>
                      )
                  )}
                </ul>
              </StyledLi>
            </Col>
          )) ||
            (risksPolicy?.filter((jay) =>
              filter.risks_id_in?.includes(jay.id)
            ) &&
              risksPolicy?.filter((jay) => filter.risks_id_in?.includes(jay.id))
                .length !== 0 && (
                <Col sm={12}>
                  <StyledLi>
                    <Names>Risks:</Names>
                    <ul>
                      {risksPolicy?.map((jay) => (
                        <li>
                          <StyledTdMini key={jay.id}>
                            <PWCLink to={`/policy/${id}/details/#risks`}>
                              {jay.name}
                            </PWCLink>
                          </StyledTdMini>
                        </li>
                      ))}
                    </ul>
                  </StyledLi>
                </Col>
              ))}

          {/* Controlss */}

          {(!showControl?.every((a) => a === false) &&
            homepageSearch !== "" && (
              <Col sm={12}>
                <StyledLi>
                  <Names>Controls:</Names>
                  <ul>
                    {controls?.map(
                      (control) =>
                        control?.description
                          ?.toLowerCase()
                          .includes(homepageSearch.toLowerCase()) && (
                          <li>
                            <StyledTdMini key={control.id}>
                              <PWCLink to={`/policy/${id}/details/#risks`}>
                                {control.description}
                              </PWCLink>
                            </StyledTdMini>
                          </li>
                        )
                    )}
                  </ul>
                </StyledLi>
              </Col>
            )) ||
            (controlsPolicy?.filter((jay) =>
              filter.controls_id_in?.includes(jay.id)
            ) &&
              controlsPolicy?.filter((jay) =>
                filter.controls_id_in?.includes(jay.id)
              ).length !== 0 && (
                <Col sm={12}>
                  <StyledLi>
                    <Names>Controls:</Names>
                    <ul>
                      {controlsPolicy?.map((jay) => (
                        <li>
                          <StyledTdMini key={jay.id}>
                            <PWCLink to={`control/${jay.id}`}>
                              {jay.description}
                            </PWCLink>
                          </StyledTdMini>
                        </li>
                      ))}
                    </ul>
                  </StyledLi>
                </Col>
              ))}

          {/* Policy Categoriess */}

          {polcatPolicy &&
            polcatPolicy.id === filter.policy_category_id_eq &&
            filter.policy_category_id_eq !== null && (
              <Col sm={12}>
                <StyledLi>
                  <Names>Policy Category:</Names>
                  <ul className="mt-1">
                    <li>
                      <StyledTdMini>
                        <PWCLink to={`/policy-category/${polcatPolicy.id}`}>
                          {polcatPolicy.name}
                        </PWCLink>
                      </StyledTdMini>
                    </li>
                  </ul>
                </StyledLi>
              </Col>
            )}
        </Row>
        <div>
          {loading ? (
            <div className={"text-center"}>
              <FaSpinner className="icon-spin" size={20} />
            </div>
          ) : parentTitle.length ? (
            <BreadCrumb crumbs={[...breadcrumb]} />
          ) : null}
        </div>
      </PolicySearchItemContainerMini>
    </Fragment>
  );
}

// =========================================================
// Three Important Part
// =========================================================

const PolicySearchItemContainerMini = styled.div`
  background: #f7f7f7;
  align-items: center;
  justify-content: space-between;
  padding: 10px 25px;
  margin-bottom: 10px;
  margin-top: 20px;
  &:last-child {
    margin-bottom: 0px;
  }
  border-radius: 3px;
  overflow: hidden;
  /* for small screen */
  @media screen and (max-width: 767px) {
    flex-direction: column;
  }
`;

// =========================================================
// Aditional Component
// =========================================================
const Names = styled.div`
  font-weight: bold;
  font-size: 15px;
  line-height: 20px;
  color: #d85604;
`;

const StyledLi = styled.li`
  padding-bottom: 10px;
  padding-top: 10px;
  left: -40px;
  list-style-type: none;
`;

const StyledTitle = styled.h4`
  & :hover {
    color: #d85604;
  }
`;

const StyledTdMini = styled.li`
  &:hover {
    color: #d85604;
  }
  font-size: 13px;
  word-break: break-all;
  width: 120%;
  text-overflow: ellipsis;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* number of lines to show */
  -webkit-box-orient: vertical;
`;
const StyledLink = styled(Link)`
  color: unset;
  text-decoration: none;
  &:focus,
  &:hover,
  &:visited,
  &:link,
  &:active {
    text-decoration: none;
  }
  &:hover {
    color: var(--primary-color);
  }
`;
