import React from "react";
import { Button as BsButton, ButtonProps as BsButtonProps } from "reactstrap";
import LoadingSpinner from "./LoadingSpinner";
import cx from "classnames";

export interface ButtonProps extends BsButtonProps {
  loading?: boolean;
}

const Button = ({ loading, className, disabled, ...props }: ButtonProps) => {
  return (
    <BsButton
      {...props}
      disabled={loading || disabled}
      className={cx("button", { disabled }, className)}
    >
      {props.children}
      {loading && <LoadingSpinner className="ml-2" />}
    </BsButton>
  );
};

export default Button;
