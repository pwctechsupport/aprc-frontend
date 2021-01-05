import React from "react";
import Tooltip from "./Tooltip";
import { date, dateFormatter } from "../formatter";
import humanizeDate from "../utils/humanizeDate";
import { AiOutlineClockCircle } from "react-icons/ai";

interface DateHoverProps {
  children: Date | number | string | null | undefined;
  withIcon?: boolean;
  humanize?: boolean;
}

export default function DateHover({ children, withIcon, humanize=true }: DateHoverProps) {
  return (
    <Tooltip description={date(children)}>
      <span className="text-secondary">
        {withIcon && <AiOutlineClockCircle className="mr-1" />}
        {humanize ? humanizeDate(children) : dateFormatter(children)}
      </span>
    </Tooltip>
  );
}
