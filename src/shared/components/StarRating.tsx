import React, { useState } from "react";
import { Tooltip } from "reactstrap";
import styled from "styled-components";

interface StarRatingProps {
  id: string;
  rating?: number | null | undefined;
  totalRating?: number | null | undefined;
  onStarClick?: (value: number) => void;
  withoutTooltip?: boolean;
}

export default function StarRating({
  id,
  rating,
  totalRating,
  onStarClick,
  withoutTooltip,
}: StarRatingProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggle = () => setTooltipOpen(!tooltipOpen);
  const tooltipId = "resourceBarTooltip" + id;
  return (
    <div>
      {!withoutTooltip && (
        <Tooltip
          placement="top"
          isOpen={tooltipOpen}
          target={tooltipId}
          toggle={toggle}
        >
          Avg. Rating: {rating} <br />
          From {totalRating} user(s)
        </Tooltip>
      )}
      <div id={tooltipId}>
        <StarRatingContainer>
          <FillRating rating={rating}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Span
                key={i}
                onClick={() => onStarClick?.(i + 1)}
                pointer={Boolean(onStarClick)}
              >
                ★
              </Span>
            ))}
          </FillRating>
          <EmptyRating>
            {Array.from({ length: 5 }).map((_, i) => (
              <EmptySpan
                key={i}
                onClick={() => onStarClick?.(i + 1)}
                pointer={Boolean(onStarClick)}
              >
                ★
              </EmptySpan>
            ))}
          </EmptyRating>
        </StarRatingContainer>
      </div>
    </div>
  );
}

// ------------------------------------------------
// Styled Components Constructor
// ------------------------------------------------

const StarRatingContainer = styled.div`
  unicode-bidi: bidi-override;
  color: #ccc;
  position: relative;
  margin: 0;
  padding: 0;
  display: inline-block;
`;
const FillRating = styled.div<{ rating: number | null | undefined }>`
  color: #e7711b;
  padding: 0;
  position: absolute;
  z-index: 1;
  display: block;
  top: 0;
  left: 0;
  overflow: hidden;
  width: ${(p) => `${(Number(p.rating) / 5) * 100}%`};
`;
const EmptyRating = styled.div`
  padding: 0;
  display: block;
  z-index: 0;
`;
const Span = styled.span<{ pointer: boolean }>`
  cursor: ${(p) => (p.pointer ? "pointer" : "default")};
`;
const EmptySpan = styled.span<{ pointer: boolean }>`
  cursor: ${(p) => (p.pointer ? "pointer" : "default")};
`;
