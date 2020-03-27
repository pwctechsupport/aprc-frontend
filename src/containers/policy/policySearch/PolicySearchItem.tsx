import React from "react";
import { Link } from "react-router-dom";
import { Col } from "reactstrap";
import styled from "styled-components";
import { Policy } from "../../../generated/graphql";
import EmptyAttribute from "../../../shared/components/EmptyAttribute";
import { previewHtml } from "../../../shared/formatter";

interface PolicySearchItemProps {
  policy: Omit<Policy, "createdAt">;
}
export default function PolicySearchItem({ policy }: PolicySearchItemProps) {
  const {
    id,
    title,
    description,
    risks,
    controls,
    resources,
    references
  } = policy;
  return (
    <PolicySearchItemContainer>
      <Col md={3} style={{ borderRight: "1px solid #d85604" }}>
        {risks?.length === 0 &&
        controls?.length === 0 &&
        resources?.length === 0 &&
        references?.length === 0 ? (
          <EmptyAttribute>No Attribute</EmptyAttribute>
        ) : (
          <StyledUl>
            {risks?.length ? (
              <StyledLi>
                <Names> Risks</Names>
                <ul>
                  {risks?.map(risk => (
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
                  {controls?.map(control => (
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
                  {resources?.map(resource => (
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
                  {references?.map(reference => (
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
      </Col>
      <Col md={9} className="ml-3">
        <StyledLink to={`/policy/${id}/details`}>
          <div>
            <StyledTitle>
              <strong>{title}</strong>
            </StyledTitle>
          </div>
          <div className="text-secondary">{previewHtml(description || "")}</div>
        </StyledLink>
      </Col>
    </PolicySearchItemContainer>
  );
}

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
`;

const PolicySearchItemContainer = styled.div`
  background: #f7f7f7;
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
