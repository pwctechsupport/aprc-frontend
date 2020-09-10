import React from "react";
import comment from "./comment.svg";
const PickIcon = ({ name, style, ...props }: PickIconProps) => {
  if (name === "comment") {
    return (
      <img
        src={comment}
        style={{ width: "30px", height: "auto", ...style }}
        {...props}
      />
    );
  } else {
    return <div></div>;
  }
};
export default PickIcon;

interface PickIconProps {
  name: string;
  style?: any;
}
