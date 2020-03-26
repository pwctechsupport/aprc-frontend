import React, { useState } from "react";
import { FaUndo, FaSpinner } from "react-icons/fa";
import { RouteComponentProps } from "react-router-dom";
import { Col, Container, Row } from "reactstrap";
import styled from "styled-components";
import { useDebounce } from "use-debounce/lib";
import { useSearchPoliciesQuery } from "../../generated/graphql";
import BreadCrumb from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import Pagination from "../../shared/components/Pagination";
import {
  SideBox,
  SideBoxSearch,
  SideBoxTitle
} from "../../shared/components/SideBox";
import Tooltip from "../../shared/components/Tooltip";
import { previewHtml } from "../../shared/formatter";
import useListState from "../../shared/hooks/useList";
import { Link } from "react-router-dom";
import EmptyAttribute from "../../shared/components/EmptyAttribute";

const SearchPolicy = ({ history }: RouteComponentProps) => {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [reference, setReference] = useState("");
  const [resource, setResource] = useState("");
  const [risk, setRisk] = useState("");
  const [control, setControl] = useState("");

  const [titleQuery] = useDebounce(title, 700);
  const [detailsQuery] = useDebounce(details, 700);
  const [resourceQuery] = useDebounce(resource, 700);
  const [referenceQuery] = useDebounce(reference, 700);
  const [controlQuery] = useDebounce(control, 700);
  const [riskQuery] = useDebounce(risk, 700);

  const { limit, handlePageChange, page } = useListState({ limit: 10 });
  const { data, loading, networkStatus, refetch } = useSearchPoliciesQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      filter: {
        title_cont: titleQuery,
        description_cont: detailsQuery,
        resources_name_cont: resourceQuery,
        references_name_cont: referenceQuery,
        controls_name_cont: controlQuery,
        risks_name_cont: riskQuery
      },
      limit,
      page
    }
  });
  const policies = data?.policies?.collection || [];
  const totalCount = data?.policies?.metadata.totalCount || 0;
  const handleReset = () => {
    setTitle("");
    setDetails("");
    setReference("");
    setResource("");
    setRisk("");
    setControl("");
  };
  return (
    <Container fluid className="p-0">
      <Row noGutters>
        <Col md={3}>
          <SideBox style={{ overflowY: "visible" }}>
            <SideBoxTitle>
              <div className="d-flex justify-content-between">
                Search Policies...
                <Tooltip description="Reset Search">
                  <Button onClick={handleReset} className="soft red" color="">
                    <FaUndo />
                  </Button>
                </Tooltip>
              </div>
            </SideBoxTitle>
            <SideBoxSearch
              search={title}
              setSearch={setTitle}
              loading={title !== "" ? loading : false}
              placeholder="Search Policy Title..."
            />
            <SideBoxSearch
              search={details}
              setSearch={setDetails}
              loading={details !== "" ? loading : false}
              placeholder="Search Policy Details..."
            />
            <SideBoxSearch
              search={reference}
              setSearch={setReference}
              loading={reference !== "" ? loading : false}
              placeholder="Search Policy Reference..."
            />
            <SideBoxSearch
              search={resource}
              setSearch={setResource}
              loading={resource !== "" ? loading : false}
              placeholder="Search Policy Resource..."
            />
            <SideBoxSearch
              search={risk}
              setSearch={setRisk}
              loading={risk !== "" ? loading : false}
              placeholder="Search Policy Risk..."
            />
            <SideBoxSearch
              search={control}
              setSearch={setControl}
              loading={control !== "" ? loading : false}
              placeholder="Search Policy Control..."
            />
            <Button
              style={{ position: "absolute", right: "5%" }}
              onClick={() => {
                refetch();
              }}
              className="soft red"
              color=""
            >
              Search
            </Button>
          </SideBox>
        </Col>
        <Col md={9} className="p-4">
          <BreadCrumb crumbs={[["/policy", "Search Policies"]]} />
          <Pagination
            totalCount={totalCount}
            perPage={limit}
            onPageChange={handlePageChange}
          />
          {policies.length ? (
            policies.map(policy => (
              <ResourceBarContainer key={policy.id}>
                <Col md={3} style={{ borderRight: "1px solid #d85604" }}>
                  {policy.risks?.length === 0 &&
                  policy.controls?.length === 0 &&
                  policy.resources?.length === 0 &&
                  policy.references?.length === 0 ? (
                    <EmptyAttribute>No Attribute</EmptyAttribute>
                  ) : (
                    <StyledUl>
                      {policy.risks?.length ? (
                        <StyledLi>
                          <Names> Risks</Names>
                          <ul>
                            {policy.risks?.map(risk => (
                              <StyledTd key={risk.id}>
                                <Link to={`/policy/${policy.id}/details/#risk`}>
                                  {risk.name}
                                </Link>
                              </StyledTd>
                            ))}
                          </ul>
                        </StyledLi>
                      ) : null}
                      {policy.controls?.length ? (
                        <StyledLi>
                          <Names>Controls:</Names>
                          <ul>
                            {policy.controls?.map(control => (
                              <StyledTd key={control.id}>
                                <Link
                                  to={`/policy/${policy.id}/details/#control`}
                                >
                                  {control.description}
                                </Link>
                              </StyledTd>
                            ))}
                          </ul>
                        </StyledLi>
                      ) : null}
                      {policy.resources?.length ? (
                        <StyledLi>
                          <Names>Resources:</Names>
                          <ul>
                            {policy.resources?.map(resource => (
                              <StyledTd key={resource.id}>
                                <Link to={`/policy/${policy.id}/resources`}>
                                  {resource.name}
                                </Link>
                              </StyledTd>
                            ))}
                          </ul>
                        </StyledLi>
                      ) : null}
                      {policy.references?.length ? (
                        <StyledLi>
                          <Names>References:</Names>
                          <ul>
                            {policy.references?.map(reference => (
                              <StyledTd key={reference.id}>
                                <Link
                                  to={`/policy/${policy.id}/details/#reference`}
                                >
                                  {reference.name}
                                </Link>
                              </StyledTd>
                            ))}
                          </ul>
                        </StyledLi>
                      ) : null}
                    </StyledUl>
                  )}
                </Col>
                <Col
                  style={{
                    marginLeft: "15px"
                  }}
                >
                  <div>
                    <div>
                      <StyledTitle>
                        <strong
                          onClick={() => {
                            history.push(`policy/${policy.id}`);
                          }}
                        >
                          {policy.title}
                        </strong>
                      </StyledTitle>
                    </div>
                    <div
                      className="text-secondary"
                      onClick={() => {
                        history.push(`policy/${policy.id}`);
                      }}
                    >
                      {previewHtml(policy.description || "")}
                    </div>
                  </div>
                </Col>
              </ResourceBarContainer>
            ))
          ) : loading || networkStatus === 2 ? (
            <div
              className={"text-center"}
              style={{ display: "block", position: "relative", top: "150%" }}
            >
              <FaSpinner className="icon-spin" size={40} />
            </div>
          ) : (
            <div className="text-center p-2 text-orange">Policy not found</div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default SearchPolicy;

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
  /* background-color: white;
  border-radius: 5px; */
`;

const ResourceBarContainer = styled.div`
  background: #f7f7f7;
  cursor: pointer;
  display: flex;
  flex-direction: row;
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
`;

const StyledUl = styled.ul`
  list-style-type: none;
`;

const StyledTitle = styled.h4`
  & :hover {
    color: #d85604;
  }
`;

const StyledTd = styled.li`
  &:hover {
    color: #d85604;
  }
  font-size: 13px;
`;
