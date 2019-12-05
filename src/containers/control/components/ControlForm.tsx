import React, { useEffect } from "react";
import useForm from "react-hook-form";
import { Form } from "reactstrap";
import {
  Assertion,
  Frequency,
  Ipo,
  Nature,
  TypeOfControl
} from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/forms/Input";
import Select from "../../../shared/components/forms/Select";

const ControlForm = ({ onSubmit, defaultValues }: ControlFormProps) => {
  const submit = (values: CreateControlFormValues) => {
    onSubmit && onSubmit(values);
  };
  const { register, handleSubmit, setValue } = useForm<CreateControlFormValues>(
    { defaultValues }
  );

  useEffect(() => {
    register({ name: "frequency" });
    register({ name: "typeOfControl" });
    register({ name: "nature" });
    register({ name: "assertion" });
    register({ name: "ipo" });
  }, [register]);

  const handleSelectChange = (name: string) => ({ value }: any) =>
    setValue(name, value);

  const pDefVal = (name: string, options: []) => {
    //prepareDefaultValue
  };

  return (
    <Form onSubmit={handleSubmit(submit)}>
      <Input name="controlOwner" label="Control Owner" innerRef={register} />
      <Input name="description" label="Description" innerRef={register} />
      <Select
        options={typeOfControls}
        onChange={handleSelectChange("typeOfControl")}
        label="Type of Controls"
        defaultValue={pDefVal("typeOfControl", [])}
      />
      <Select
        options={frequencies}
        onChange={handleSelectChange("frequency")}
        label="Frequency"
      />
      <Select
        options={natures}
        onChange={handleSelectChange("nature")}
        label="Nature"
      />
      <Select
        options={assertions}
        onChange={handleSelectChange("assertion")}
        label="Assertion"
      />
      <Select options={ipos} onChange={handleSelectChange("ipo")} label="IPO" />
      <div className="d-flex justify-content-end">
        <Button className="pwc" type="submit">
          Submit
        </Button>
      </div>
    </Form>
  );
};

export default ControlForm;

// -------------------------------------------------------------------------
// Construct Options
// -------------------------------------------------------------------------

const frequencies = Object.entries(Frequency).map(([label, value]) => ({
  label,
  value
}));

const typeOfControls = Object.entries(TypeOfControl).map(([label, value]) => ({
  label,
  value
}));

const natures = Object.entries(Nature).map(([label, value]) => ({
  label,
  value
}));

const ipos = Object.entries(Ipo).map(([label, value]) => ({
  label,
  value
}));

const assertions = Object.entries(Assertion).map(([label, value]) => ({
  label,
  value
}));

// -------------------------------------------------------------------------
// Type Definitions
// -------------------------------------------------------------------------

export interface ControlFormProps {
  defaultValues?: CreateControlFormValues;
  onSubmit?: (val: CreateControlFormValues) => void;
}

export interface CreateControlFormValues {
  controlOwner: string;
  typeOfControl: TypeOfControl;
  frequency: Frequency;
  nature: Nature;
  ipo: Ipo;
  assertion: Assertion;
  description?: string;
}
