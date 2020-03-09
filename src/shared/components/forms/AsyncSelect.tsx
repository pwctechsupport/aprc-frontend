import classnames from "classnames";
import React, { useEffect } from "react";
import AsyncReactSelect, { Props } from "react-select/async";
import { Col, FormGroup, Label } from "reactstrap";
import { Suggestions } from "../../formatter";

export default function AsyncSelect({
  name,
  register,
  setValue,
  error,
  row,
  label,
  required,
  ...rest
}: AsyncSelectProps) {
  useEffect(() => {
    register({ name });
  }, [name, register]);

  function handleChange(e: any) {
    console.log("ini valuenya:", e);
    setValue(name, e);
    // if (rest.isMulti) {
    //   setValue(name, e && e.map((v: any) => v.value));
    // } else {
    //   setValue(name, e && e.value);
    // }
  }

  const Select = (
    <AsyncReactSelect
      {...rest}
      className={classnames(
        "enlogy-react-select",
        error ? "invalid" : undefined
      )}
      onChange={handleChange}
    />
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
}

export interface AsyncSelectProps extends Props<Option> {
  name: string;
  register: Function;
  setValue: Function;
  label?: string;
  defaultValue?: Suggestions | Option;
  row?: boolean;
  required?: boolean;
  formText?: string;
  error?: string;
}

type Option = { label: string; value: string };
