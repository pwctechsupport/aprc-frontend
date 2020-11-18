import React, { Fragment, ReactNode } from "react";
import {
  FormGroup,
  Col,
  Input as BsInput,
  InputProps as BsInputProps,
  FormFeedback,
  FormText
} from "reactstrap";

import Label from "./Label";

// =============================================================================
// Components
// =============================================================================

const Input = ({
  label,
  required,
  error,
  row,
  fgclass,
  formText,
  type,
  ...inputProps
}: InputProps) => {
  const Field = (
    <Fragment>
      <BsInput
        invalid={error ? true : false}
        {...inputProps}
        type={type}
        placeholder={inputProps.placeholder || label}
        className={type === "checkbox" ? "ml-2" : ""}
      />
      <FormFeedback>{error}</FormFeedback>
      <FormText>{formText}</FormText>
    </Fragment>
  );

  return (
    <FormGroup row={row} className={fgclass}>
      {label ? (
        <Label required={required} sm={row ? 3 : undefined}>
          {label}
        </Label>
      ) : null}
      {row ? <Col sm={9}>{Field}</Col> : Field}
    </FormGroup>
  );
};

export default Input;

// =============================================================================
// Typedef
// =============================================================================

export interface InputProps extends BsInputProps {
  label?: string;
  required?: boolean;
  error?: string;
  row?: boolean;
  formText?: ReactNode;
}
