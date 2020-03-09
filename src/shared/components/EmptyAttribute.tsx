import React from "react";
import c from "classnames";

const EmptyAttribute = ({ centered = true }: { centered?: boolean }) => {
  return (
    <div className={c("text-grey", { "text-center": centered })}>Empty</div>
  );
};

export default EmptyAttribute;
