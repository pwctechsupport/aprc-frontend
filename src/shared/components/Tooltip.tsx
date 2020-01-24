import React, { useState, useMemo } from "react";
import { Tooltip as BsTooltip } from "reactstrap";
import styled from "styled-components";

const Tooltip = ({ description, children, subtitle }: TooltipProps) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggle = () => setTooltipOpen(!tooltipOpen);
  const tooltipId = useMemo(
    () => "tooltip" + Math.floor(Math.random() * 1000),
    []
  );

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
      <div id={tooltipId}>{children}</div>
    </>
  );
};

export default Tooltip;

const Subtitle = styled.div`
  font-size: smaller;
`;

interface TooltipProps {
  description?: string;
  subtitle?: string;
  children: React.ReactChild;
}
