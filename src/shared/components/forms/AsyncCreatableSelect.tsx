import classnames from "classnames";
import React, { useEffect, Fragment } from "react";
import AsyncCreatable, { Props } from "react-select/async-creatable";
import { Col, FormGroup, Label, FormText } from "reactstrap";
import { Suggestions } from "../../formatter";

export default function AsyncCreatableSelect({
  name,
  register,
  setValue,
  error,
  row,
  label,
  required,
  formText,
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
      <div
        style={{
          border: `${error ? "1px solid red" : ""}`,
          borderRadius: "6px",
        }}
      >
        <AsyncCreatable
          {...rest}
          closeMenuOnSelect={!rest.isMulti}
          className={classnames(error ? "invalid" : undefined)}
          onChange={handleChange}
        />
      </div>
      <FormText>{formText}</FormText>
      {error && (
        <FormText className="text-danger " color="red">
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
