import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Policy } from "../../../generated/graphql";
// import EmptyAttribute from "../../../shared/components/EmptyAttribute";
import { previewHtml } from "../../../shared/formatter";
import DateHover from "../../../shared/components/DateHover";
import { Row, Col } from "reactstrap";

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

  // console.log('policy', policy);

  // console.log('filter',filter);
  // console.log('policy', policy);
  // const noAttribute =
  //   risks?.length === 0 &&
  //   controls?.length === 0 &&
  //   resources?.length === 0 &&
  //   references?.length === 0;

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
  console.log("filter.policy_category_id_eq", filter.policy_category_id_eq);
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
              <DateHover withIcon>{updatedAt}</DateHover>
            </div>
            <div className="text-secondary ml-2">
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
        {/* Resourcess */}

        <Row style={{ marginLeft: "1vw", marginRight: "1vw" }}>
          {(!showResource?.every((a) => a === false) &&
            homepageSearch !== "" && (
              <Col>
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
                              <Link to={`/policy/${id}/resources`}>
                                {resource.name}
                              </Link>
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
                <Col>
                  <StyledLi>
                    <Names>Resources:</Names>
                    <ul>
                      {resourcesPolicy?.map((resource) => (
                        <li>
                          <StyledTdMini key={resource.id}>
                            <Link to={`/policy/${id}/details/#references`}>
                              {resource.name}
                            </Link>
                          </StyledTdMini>
                        </li>
                      ))}
                    </ul>
                  </StyledLi>
                </Col>
              ))}

          {/* Referencess */}
          {(!showReference?.every((a) => a === false) &&
            homepageSearch !== "" && (
              <Col>
                <StyledLi>
                  <Names>References:</Names>
                  <ul>
                    {references?.map(
                      (reference) =>
                        reference?.name
                          ?.toLowerCase()
                          .includes(homepageSearch.toLowerCase()) && (
                          <li>
                            <StyledTdMini key={reference.id}>
                              <Link to={`/policy/${id}/details/#references`}>
                                {reference.name}
                              </Link>
                            </StyledTdMini>
                          </li>
                        )
                    )}
                  </ul>
                </StyledLi>
              </Col>
            )) ||
            (referencesPolicy?.filter((ref) =>
              filter.references_id_in?.includes(ref.id)
            ) &&
              referencesPolicy?.filter((ref) =>
                filter.references_id_in?.includes(ref.id)
              ).length !== 0 && (
                <Col>
                  <StyledLi>
                    <Names>References:</Names>
                    <ul>
                      {referencesPolicy?.map((reference) => (
                        <li>
                          <StyledTdMini key={reference.id}>
                            <Link to={`/policy/${id}/details/#references`}>
                              {reference.name}
                            </Link>
                          </StyledTdMini>
                        </li>
                      ))}
                    </ul>
                  </StyledLi>
                </Col>
              ))}
          {/* Riskss */}
          {(!showRisk?.every((a) => a === false) && homepageSearch !== "" && (
            <Col>
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
                            <Link to={`/policy/${id}/details/#risks`}>
                              {risk.name}
                            </Link>
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
                <Col>
                  <StyledLi>
                    <Names>Risks:</Names>
                    <ul>
                      {risksPolicy?.map((jay) => (
                        <li>
                          <StyledTdMini key={jay.id}>
                            <Link to={`/policy/${id}/details/#risks`}>
                              {jay.name}
                            </Link>
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
              <Col>
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
                              <Link to={`/policy/${id}/details/#risks`}>
                                {control.description}
                              </Link>
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
                <Col>
                  <StyledLi>
                    <Names>Controls:</Names>
                    <ul>
                      {controlsPolicy?.map((jay) => (
                        <li>
                          <StyledTdMini key={jay.id}>
                            <Link to={`control/${jay.id}`}>
                              {jay.description}
                            </Link>
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
              <Col>
                <StyledLi>
                  <Names>Policy Category:</Names>
                  <ul className="mt-1">
                    <li>
                      <StyledTdMini>
                        <Link to={`/policy-category/${polcatPolicy.id}`}>
                          {polcatPolicy.name}
                        </Link>
                      </StyledTdMini>
                    </li>
                  </ul>
                </StyledLi>
              </Col>
            )}
        </Row>
      </PolicySearchItemContainerMini>
      {/* <PolicySearchItemContainer>
          <AttributeSection>
            {noAttribute ? (
              <EmptyAttribute>No Attribute</EmptyAttribute>
            ) : (
              <StyledUl>
                {risks?.length ? (
                  <StyledLi>
                    <Names> Risks</Names>
                    <ul>
                      {risks?.map((risk) => (
                        <StyledTd key={risk.id}>
                          <Link to={`/policy/${id}/details/#risks`}>
                            {risk.name}
                          </Link>
                        </StyledTd>
                      ))}
                    </ul>
                  </StyledLi>
                ) : null}
                {controls?.length ? (
                  <StyledLi>
                    <Names>Controls:</Names>
                    <ul>
                      {controls?.map((control) => (
                        <StyledTd key={control.id}>
                          <Link to={`/policy/${id}/details/#controls`}>
                            {control.description}
                          </Link>
                        </StyledTd>
                      ))}
                    </ul>
                  </StyledLi>
                ) : null}
                {resources?.length ? (
                  <StyledLi>
                    <Names>Resources:</Names>
                    <ul>
                      {resources?.map((resource) => (
                        <StyledTd key={resource.id}>
                          <Link to={`/policy/${id}/resources`}>
                            {resource.name}
                          </Link>
                        </StyledTd>
                      ))}
                    </ul>
                  </StyledLi>
                ) : null}
                {references?.length ? (
                  <StyledLi>
                    <Names>References:</Names>
                    <ul>
                      {references?.map((reference) => (
                        <StyledTd key={reference.id}>
                          <Link to={`/policy/${id}/details/#references`}>
                            {reference.name}
                          </Link>
                        </StyledTd>
                      ))}
                    </ul>
                  </StyledLi>
                ) : null}
              </StyledUl>
            )}
          </AttributeSection>
          <TitleAndDescriptionSection>
            <StyledLink to={`/policy/${id}/details`}>
              <div className="text-right">
                <DateHover withIcon>{updatedAt}</DateHover>
              </div>
              <div>
                <StyledTitle>
                  <strong>{title}</strong>
                </StyledTitle>
              </div>
              <div className="text-secondary">
                {previewHtml(description || "")}
              </div>
            </StyledLink>
          </TitleAndDescriptionSection>
        </PolicySearchItemContainer>
      )} */}
    </Fragment>
  );
}

// =========================================================
// Three Important Part
// =========================================================
// const PolicySearchItemContainer = styled.div`
//   display: flex;
//   flex-direction: row;
//   background: #f7f7f7;
//   align-items: center;
//   justify-content: space-between;
//   padding: 10px 15px;
//   margin-bottom: 10px;
//   margin-top: 20px;
//   &:last-child {
//     margin-bottom: 0px;
//   }
//   border-radius: 5px;
//   overflow: hidden;
//   /* for small screen */
//   @media screen and (max-width: 767px) {
//     flex-direction: column;
//   }
// `;
const PolicySearchItemContainerMini = styled.div`
  /* display: flex;
  flex-direction: row; */
  background: #f7f7f7;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  margin-bottom: 10px;
  margin-top: 20px;
  &:last-child {
    margin-bottom: 0px;
  }
  border-radius: 5px;
  overflow: hidden;
  /* for small screen */
  @media screen and (max-width: 767px) {
    flex-direction: column;
  }
`;
// const TitleAndDescriptionSection = styled.div`
//   width: 60%;
//   margin-left: 1.5rem;
//   /* for small screen */
//   @media screen and (max-width: 767px) {
//     order: 1;
//     width: 100%;
//     margin: unset;
//   }
// `;
// const AttributeSection = styled.div`
//   width: 40%;
//   border-right: 1px solid #d85604;
//   /* for small screen */
//   @media screen and (max-width: 767px) {
//     order: 2;
//     width: 100%;
//     border-right: unset;
//   }
// `;

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
  position: relative;
  left: -40px;
  list-style-type: none;
`;

// const StyledUl = styled.ul`
//   list-style-type: none;
// `;

const StyledTitle = styled.h4`
  & :hover {
    color: #d85604;
  }
`;

// const StyledTd = styled.li`
//   &:hover {
//     color: #d85604;
//   }
//   font-size: 13px;
//   word-break: break-all;
//   width: 140%;
// `;

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
