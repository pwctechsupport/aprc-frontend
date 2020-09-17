import React from "react";
import c from "classnames";

const EmptyAttribute = ({
  children,
  centered = true,
  style,
}: {
  children?: React.ReactNode;
  centered?: boolean;
  style?: any;
}) => {
  return (
    <div
      className={c("text-grey", "my-2", { "text-center": centered })}
      style={style}
    >
      {children || "Empty"}
    </div>
  );
};

export default EmptyAttribute;
