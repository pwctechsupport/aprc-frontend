import React from "react";
import { Link } from "react-router-dom";
import { components } from "react-select";
import Select from "react-select/async";
import { Badge } from "reactstrap";
import styled from "styled-components";
import {
  PoliciesDocument,
  PoliciesQuery,
  Policy
} from "../../generated/graphql";
import { previewHtml } from "../../shared/formatter";
import useLazyQueryReturnPromise from "../../shared/hooks/useLazyQueryReturnPromise";

export default function HomepageSearch() {
  const loadPolicies = useLoadPolicies();
  return (
    <Select
      placeholder="Search Policy..."
      components={{ Option }}
      loadOptions={loadPolicies}
      defaultOptions
    />
  );
}

const Option = (props: any) => {
  const id = props?.data?.id;
  const title = props?.data?.title;
  const description = props?.data?.description;
  const risks = props?.data?.risks || [];
  const controls = props?.data?.controls || [];
  const resources = props?.data?.resources || [];
  const references = props?.data?.references || [];
  return (
    <StyledLink to={`/policy/${id}/details`}>
      <components.Option {...props}>
        <h5>{title}</h5>
        <PreviewSpan>{previewHtml(description, 200)}</PreviewSpan>
        <div>
          {risks.length ? (
            <div>
              <CompressedText>Risks:</CompressedText>
              <SmallerPreviewSpan>
                {" "}
                {risks.map((risk: any) => risk.name).join(", ")}
              </SmallerPreviewSpan>
            </div>
          ) : null}
        </div>
        <div>
          {controls.length ? (
            <div>
              <CompressedText>Controls:</CompressedText>
              <SmallerPreviewSpan>
                {controls.map((control: any) => control.description).join(", ")}
              </SmallerPreviewSpan>
            </div>
          ) : null}
        </div>
        <div>
          {resources.length ? (
            <div>
              <CompressedText>Resources:</CompressedText>
              <SmallerPreviewSpan>
                {" "}
                {resources.map((resource: any) => resource.name).join(", ")}
              </SmallerPreviewSpan>
            </div>
          ) : null}
        </div>
        <div>
          {references?.map((reference: any) => (
            <Badge key={reference.id} className="mx-1">
              {reference.name}
            </Badge>
          ))}
        </div>
      </components.Option>
    </StyledLink>
  );
};

// =============================================
// Styled Components
// =============================================

const PreviewSpan = styled.span`
  color: rgba(0, 0, 0, 0.5);
`;

const SmallerPreviewSpan = styled(PreviewSpan)`
  font-size: smaller;
`;

const StyledLink = styled(Link)`
  color: unset;
  backgroundColor: "white";
  &:hover {
    text-decoration: none;
  }
`;

const CompressedText = styled.span`
  letter-spacing: 1.5px;
  font-size: smaller;
`;

// =============================================
// Custom Hooks
// =============================================

type MyPolicy = Omit<Policy, "createdAt" | "updatedAt">;

function useLoadPolicies() {
  const query = useLazyQueryReturnPromise<PoliciesQuery>(PoliciesDocument);
  async function getSuggestions(keyword: string = ""): Promise<MyPolicy[]> {
    try {
      const { data } = await query({
        filter: {
          references_name_or_risks_name_or_controls_description_or_resources_name_or_title_or_description_cont: keyword
        },
        withDetail: true
      });
      return data.policies?.collection || [];
    } catch (error) {
      return [];
    }
  }
  return getSuggestions;
}
