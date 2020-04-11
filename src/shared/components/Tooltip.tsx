import uniqueId from "lodash/uniqueId";
import React, { useMemo, useState } from "react";
import { Tooltip as BsTooltip } from "reactstrap";
import styled from "styled-components";

interface TooltipProps {
  description?: string;
  subtitle?: string;
  children: React.ReactChild;
}

export default function Tooltip({
  description,
  children,
  subtitle,
}: TooltipProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggle = () => setTooltipOpen(!tooltipOpen);
  const tooltipId = useMemo(() => "tooltip" + uniqueId(), []);

  return (
    <>
      <BsTooltip
        placement="top"
        isOpen={tooltipOpen}
        autohide={false}
        target={tooltipId}
        toggle={toggle}
      >
        {description}
        <Subtitle>{subtitle}</Subtitle>
      </BsTooltip>
      <div id={tooltipId} className="d-inline-block">
        {children}
      </div>
    </>
  );
}

const Subtitle = styled.div`
  font-size: smaller;
`;
