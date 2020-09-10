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
import checkmark from "./checkMark.svg";
import downloadWhite from "./download-white.svg";

const PickIcon = ({ name, style, ...props }: PickIconProps) => {
  if (name === "comment") {
    return (
      <img
        src={comment}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "minus") {
    return (
      <img
        src={minus}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "add-user") {
    return (
      <img
        src={addUser}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "avatar") {
    return (
      <img
        src={avatar}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "bookmark") {
    return (
      <img
        src={bookmark}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "chart") {
    return (
      <img
        src={chart}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "check") {
    return (
      <img
        src={check}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "download") {
    return (
      <img
        src={download}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "notif") {
    return (
      <img
        src={notif}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "reload") {
    return (
      <img
        src={reload}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "three-dots") {
    return (
      <img
        src={threeDots}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "trash") {
    return (
      <img
        src={trash}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "upload") {
    return (
      <img
        src={upload}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "x-icon") {
    return (
      <img
        src={xIcon}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "printer") {
    return (
      <img
        src={printer}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "checkmark") {
    return (
      <img
        src={checkmark}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "download white") {
    return (
      <img
        src={downloadWhite}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
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
