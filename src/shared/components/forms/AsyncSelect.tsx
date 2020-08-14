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
  isResourcePolicy,
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
  const styles = {
    multiValue: (base: any, state: any) => {
      return isResourcePolicy &&
        defaultValue?.find((a: any) => a.value === state.data.value)
        ? { ...base, backgroundColor: "gray" }
        : base;
    },
    multiValueLabel: (base: any, state: any) => {
      return isResourcePolicy &&
        defaultValue.find((a: any) => a.value === state.data.value)
        ? { ...base, fontWeight: "bold", color: "white", paddingRight: 6 }
        : base;
    },
    multiValueRemove: (base: any, state: any) => {
      return isResourcePolicy &&
        defaultValue.find((a: any) => a.value === state.data.value)
        ? { ...base, display: "none" }
        : base;
    },
  };
  const Select = (
    <Fragment>
      <div
        style={{
          border: `${error ? "1px solid red" : ""} `,
          borderRadius: "6px",
        }}
      >
        <AsyncReactSelect
          {...rest}
          closeMenuOnSelect={rest.closeMenuOnSelect ?? !rest.isMulti}
          className={classnames(error ? "invalid" : undefined)}
          onChange={handleChange}
          classNamePrefix="select"
          isClearable={!isResourcePolicy}
          defaultValue={defaultValue}
          styles={styles}
        />
      </div>

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
  defaultValue?: Suggestions | Option | any;
  row?: boolean;
  required?: boolean;
  formText?: string;
  error?: string;
  isResourcePolicy?: boolean;
}

type Option = { label: string; value: string };
