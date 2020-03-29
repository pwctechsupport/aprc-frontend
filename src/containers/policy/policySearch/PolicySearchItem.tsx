import React from "react";
import { Link } from "react-router-dom";
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

  const noAttribute =
    risks?.length === 0 &&
    controls?.length === 0 &&
    resources?.length === 0 &&
    references?.length === 0;

  return (
    <PolicySearchItemContainer>
      <AttributeSection>
        {noAttribute ? (
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
      </AttributeSection>
      <TitleAndDescriptionSection>
        <StyledLink to={`/policy/${id}/details`}>
          <div>
            <StyledTitle>
              <strong>{title}</strong>
            </StyledTitle>
          </div>
          <div className="text-secondary">{previewHtml(description || "")}</div>
        </StyledLink>
      </TitleAndDescriptionSection>
    </PolicySearchItemContainer>
  );
}

// =========================================================
// Three Important Part
// =========================================================
const PolicySearchItemContainer = styled.div`
  display: flex;
  flex-direction: row;
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

const TitleAndDescriptionSection = styled.div`
  width: 60%;
  margin-left: 1.5rem;
  /* for small screen */
  @media screen and (max-width: 767px) {
    order: 1;
    width: 100%;
    margin: unset;
  }
`;
const AttributeSection = styled.div`
  width: 40%;
  border-right: 1px solid #d85604;
  /* for small screen */
  @media screen and (max-width: 767px) {
    order: 2;
    width: 100%;
    border-right: unset;
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
  position: relative;
  left: -40px;
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
