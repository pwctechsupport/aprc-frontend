import React from "react";
import { Label as BsLabel, LabelProps } from "reactstrap";
import classnames from "classnames";

interface ILabel extends LabelProps {
  required?: boolean;
}

const Label = (props: ILabel) => {
  return (
    <BsLabel
      {...props}
      className={classnames("quicksand-bold", props.className)}
    >
      {props.children}
      {props.required && <span className="text-danger">*</span>}
    </BsLabel>
  );
};

export default Label;
