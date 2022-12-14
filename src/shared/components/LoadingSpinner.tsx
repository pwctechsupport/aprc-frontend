import React from "react";
import { FaSpinner } from "react-icons/fa";
import classnames from "classnames";
import { IconBaseProps } from "react-icons/lib/cjs";

interface LoadingSpinnerProps extends IconBaseProps {
  centered?: boolean;
  className?: string;
  biggerSize?: boolean;
}

const LoadingSpinner = ({
  centered,
  className,
  biggerSize,
  ...props
}: LoadingSpinnerProps) => {
  return (
    <div
      className={classnames(centered ? "text-center" : "", className)}
      style={{ display: centered ? "block" : "inline-block" }}
    >
      <FaSpinner className="icon-spin" size={biggerSize ? 30 : 15} {...props} />
    </div>
  );
};

export default LoadingSpinner;
