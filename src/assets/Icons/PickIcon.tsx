import React from "react";
import minus from "./minus.svg";
import comment from "./comment.svg";
import avatar from "./avatar.svg";
import bookmark from "./bookmark.svg";
import addUser from "./add-user.svg";
import chart from "./chart.svg";
import check from "./check.svg";
import download from "./download.svg";
import notif from "./notif.svg";
import reload from "./reload.svg";
import threeDots from "./three-dots.svg";
import trash from "./trash.svg";
import upload from "./upload.svg";
import xIcon from "./x-icon.svg";
import printer from "./printer.svg";
import checkmark from "./checkmark.svg";

const PickIcon = ({ name, style, ...props }: PickIconProps) => {
  if (name === "comment") {
    return (
      <img
        src={comment}
        style={{ width: "30px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "minus") {
    return (
      <img
        src={minus}
        style={{ width: "30px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "add-user") {
    return (
      <img
        src={addUser}
        style={{ width: "30px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "avatar") {
    return (
      <img
        src={avatar}
        style={{ width: "30px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "bookmark") {
    return (
      <img
        src={bookmark}
        style={{ width: "30px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "chart") {
    return (
      <img
        src={chart}
        style={{ width: "30px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "check") {
    return (
      <img
        src={check}
        style={{ width: "30px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "download") {
    return (
      <img
        src={download}
        style={{ width: "30px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "notif") {
    return (
      <img
        src={notif}
        style={{ width: "30px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "reload") {
    return (
      <img
        src={reload}
        style={{ width: "30px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "three-dots") {
    return (
      <img
        src={threeDots}
        style={{ width: "30px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "trash") {
    return (
      <img
        src={trash}
        style={{ width: "30px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "upload") {
    return (
      <img
        src={upload}
        style={{ width: "30px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "x-icon") {
    return (
      <img
        src={xIcon}
        style={{ width: "30px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "printer") {
    return (
      <img
        src={printer}
        style={{ width: "30px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "checkmark") {
    return (
      <img
        src={checkmark}
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
