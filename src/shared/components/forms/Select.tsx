import React, { Fragment } from "react";
import ReactSelect, { Props } from "react-select";
import { FormGroup, Col, FormText } from "reactstrap";
import Label from "./Label";
import classnames from "classnames";

interface SelectProps extends Props {
  label?: string;
  defaultValue?: any;
  row?: boolean;
  required?: boolean;
  formText?: string;
  error?: string;
}

const Select = ({
  label,
  row,
  formText,
  error,
  required,
  ...props
}: SelectProps) => {
  const Select = (
    <Fragment>
      <ReactSelect
        className={classnames(
          "enlogy-react-select",
          error ? "invalid" : undefined
        )}
        classNamePrefix="enlogy"
        {...props}
        components={{ IndicatorSeparator: null }}
        placeholder={props.placeholder || label || ""}
      />
      <FormText>{formText}</FormText>
      {error && (
        <FormText className="text-danger pl-3" color="red">
          {error}
        </FormText>
      )}
    </Fragment>
  );

  return (
    <FormGroup row={row}>
      {label ? (
        <Label required={required} sm={row ? 3 : undefined}>
          {label}
        </Label>
      ) : null}
      {row ? <Col sm={9}>{Select}</Col> : Select}
    </FormGroup>
  );
};

export default Select;
