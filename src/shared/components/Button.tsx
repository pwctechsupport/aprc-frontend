import React from "react";
import { Button as BsButton, ButtonProps as BsButtonProps } from "reactstrap";
import LoadingSpinner from "./LoadingSpinner";

interface ButtonProps extends BsButtonProps {
  loading?: boolean;
}

const Button = ({ loading, ...props }: ButtonProps) => {
  return (
    <BsButton disabled={loading} {...props} className="button">
      {props.children}
      {loading && <LoadingSpinner className="ml-2" />}
    </BsButton>
  );
};

export default Button;
