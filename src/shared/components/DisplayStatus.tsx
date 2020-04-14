import { capitalCase } from "capital-case";
import React from "react";
import { Badge } from "reactstrap";
import { Status } from "../../generated/graphql";
import Tooltip from "./Tooltip";
import styled from "styled-components";

interface DisplayStatusProps {
  children: string | null | undefined;
}

export default function DisplayStatus({ children }: DisplayStatusProps) {
  const description = getStatusDescription(children);
  return (
    <Tooltip description={description}>
      <StyledBadge bg={getStatusColor(children)}>
        {capitalCase(children || "")}
      </StyledBadge>
    </Tooltip>
  );
}

function getStatusDescription(status: string | null | undefined): string {
  if (status === Status.Release) {
    return "It is released and can be seen by anyone";
  }
  if (status === Status.Draft) {
    return "It is a draft";
  }
  if (status === Status.ReadyForEdit) {
    return "You have been granted access to edit this document";
  }
  if (status === Status.WaitingForApproval) {
    return "You are asking for edit access, waiting Admin approval";
  }
  if (status === Status.WaitingForReview) {
    return "Your already submitted your draft, waiting Admin review";
  }
  return "";
}

function getStatusColor(status: string | null | undefined): string {
  if (status === Status.Release) {
    return "#24b51f";
  }
  if (status === Status.Draft) {
    return "#697368";
  }
  if (status === Status.ReadyForEdit) {
    return "#bf9e30";
  }
  if (status === Status.WaitingForApproval) {
    return "#1a58c9";
  }
  if (status === Status.WaitingForReview) {
    return "#0e3273";
  }
  return "";
}

const StyledBadge = styled(Badge)<{ bg: string }>`
  mix-blend-mode: darken;
  background-color: ${(p) => p.bg};
`;
