import React from "react";
import c from "classnames";

const EmptyAttribute = ({
  children,
  centered = true
}: {
  children?: React.ReactNode;
  centered?: boolean;
}) => {
  return (
    <div className={c("text-grey", "my-2", { "text-center": centered })}>
      {children || "Empty"}
    </div>
  );
};

export default EmptyAttribute;
