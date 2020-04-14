import classnames from "classnames";
import React, { useEffect, Fragment } from "react";
import AsyncReactSelect, { Props } from "react-select/async";
import { Col, FormGroup, Label, FormText } from "reactstrap";
import { Suggestions } from "../../formatter";

export default function AsyncSelect({
  name,
  register,
  setValue,
  error,
  row,
  label,
  required,
  defaultValue,
  ...rest
}: AsyncSelectProps) {
  useEffect(() => {
    register({ name });
  }, [name, register]);

  function handleChange(e: any) {
    // console.log("ini valuenya:", e);
    setValue(name, e);
    // if (rest.isMulti) {
    //   setValue(name, e && e.map((v: any) => v.value));
    // } else {
    //   setValue(name, e && e.value);
    // }
  }
  const Select = (
    <Fragment>
      <AsyncReactSelect
        {...rest}
        closeMenuOnSelect={rest.closeMenuOnSelect ?? !rest.isMulti}
        className={classnames(error ? "invalid" : undefined)}
        onChange={handleChange}
        defaultValue={defaultValue}
      />
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
      {row ? <Col sm={label ? 9 : undefined}>{Select}</Col> : Select}
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
