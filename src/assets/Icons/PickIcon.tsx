import React from "react";
import minus from "./minus.svg";
import comment from "./comment.svg";
import avatar from "./avatar.svg";
import bookmark from "./bookmark.svg";
import addUser from "./add-user.svg";
import chart from "./chart.svg";
import check from "./check.svg";
import notif from "./notif.svg";
import reload from "./reload.svg";
import threeDots from "./three-dots.svg";
import trash from "./trash.svg";
import upload from "./upload.svg";
import xIcon from "./x-icon.svg";
import printer from "./printer.svg";
import checkmark from "./checkMark.svg";
import downloadWhite from "./download-white.svg";
import download from "./download.svg";
import reloadOrange from "./reload-orange.svg";
import pencilFill from "./pencil-fill.svg";
import pencilO from "./pencil-outline.svg";

const PickIcon = ({ name, style, className, ...props }: PickIconProps) => {
  if (name === "comment") {
    return (
      <img
        className={className}
        src={comment}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "minus") {
    return (
      <img
        className={className}
        src={minus}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "add-user") {
    return (
      <img
        className={className}
        src={addUser}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "avatar") {
    return (
      <img
        className={className}
        src={avatar}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "bookmark") {
    return (
      <img
        className={className}
        src={bookmark}
        alt="icon"
        style={{
          width: "25px",
          height: "auto",
          ...style,
        }}
        {...props}
      />
    );
  } else if (name === "chart") {
    return (
      <img
        className={className}
        src={chart}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "check") {
    return (
      <img
        className={className}
        src={check}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "download") {
    return (
      <img
        className={className}
        src={downloadWhite}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "downloadOrange") {
    return (
      <img
        className={className}
        src={download}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "notif") {
    return (
      <img
        className={className}
        src={notif}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "reload") {
    return (
      <img
        className={className}
        src={reload}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "reloadOrange") {
    return (
      <img
        className={className}
        src={reloadOrange}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "three-dots") {
    return (
      <img
        className={className}
        src={threeDots}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "trash") {
    return (
      <img
        className={className}
        src={trash}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "upload") {
    return (
      <img
        className={className}
        src={upload}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "x-icon") {
    return (
      <img
        className={className}
        src={xIcon}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "printer") {
    return (
      <img
        className={className}
        src={printer}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "checkmark") {
    return (
      <img
        className={className}
        src={checkmark}
        alt="icon"
        style={{ width: "25px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "pencilFill") {
    return (
      <img
        className={className}
        src={pencilFill}
        alt="icon"
        style={{ width: "18px", height: "auto", ...style }}
        {...props}
      />
    );
  } else if (name === "pencilO") {
    return (
      <img
        className={className}
        src={pencilO}
        alt="icon"
        style={{ width: "15px", height: "auto", ...style }}
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
  className?: string;
}
