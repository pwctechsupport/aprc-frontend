import React from "react";
import Tooltip from "./Tooltip";
import { date } from "../formatter";
import humanizeDate from "../utils/humanizeDate";
import { AiOutlineClockCircle } from "react-icons/ai";

interface DateHoverProps {
  children: Date | number | string | null | undefined;
  withIcon?: boolean;
}

export default function DateHover({ children, withIcon }: DateHoverProps) {
  return (
    <Tooltip description={date(children)}>
      <span className="text-secondary">
        {withIcon && <AiOutlineClockCircle className="mr-1" />}
        {humanizeDate(children)}
      </span>
    </Tooltip>
  );
}
