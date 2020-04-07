import React from "react";
import Tooltip from "./Tooltip";
import { date } from "../formatter";
import humanizeDate from "../utils/humanizeDate";

interface DateHoverProps {
  children: Date | number | string | null | undefined;
}

export default function DateHover({ children }: DateHoverProps) {
  return (
    <Tooltip description={date(children)}>{humanizeDate(children)}</Tooltip>
  );
}
