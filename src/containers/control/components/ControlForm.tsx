import React, { useEffect } from "react";
import useForm from "react-hook-form";
import { Form } from "reactstrap";
import {
  Assertion,
  Frequency,
  Ipo,
  Nature,
  TypeOfControl,
  Status
} from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/forms/Input";
import Select from "../../../shared/components/forms/Select";
import { oc } from "ts-optchain";
import { capitalCase } from "capital-case";

const ControlForm = ({
  onSubmit,
  defaultValues,
  submitting
}: ControlFormProps) => {
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
    register({ name: "status" });
  }, [register]);

  const handleSelectChange = (name: string) => ({ value }: any) =>
    setValue(name, value);

  const pDefVal = (value: any, options: Options) => {
    return options.find(opt => opt.value === value);
  };

  const typeOfControl = oc(defaultValues).typeOfControl();
  const frequency = oc(defaultValues).frequency();
  const nature = oc(defaultValues).nature();
  const assertion = oc(defaultValues).assertion();
  const ipo = oc(defaultValues).ipo();
  const status = oc(defaultValues).status();

  return (
    <Form onSubmit={handleSubmit(submit)}>
      <Input name="controlOwner" label="Control Owner" innerRef={register} />
      <Input name="description" label="Description" innerRef={register} />
      <Select
        options={typeOfControls}
        onChange={handleSelectChange("typeOfControl")}
        label="Type of Controls"
        defaultValue={pDefVal(typeOfControl, typeOfControls)}
      />
      <Select
        options={frequencies}
        onChange={handleSelectChange("frequency")}
        label="Frequency"
        defaultValue={pDefVal(frequency, frequencies)}
      />
      <Select
        options={natures}
        onChange={handleSelectChange("nature")}
        label="Nature"
        defaultValue={pDefVal(nature, natures)}
      />
      <Select
        options={assertions}
        onChange={handleSelectChange("assertion")}
        label="Assertion"
        defaultValue={pDefVal(assertion, assertions)}
      />
      <Select
        options={ipos}
        onChange={handleSelectChange("ipo")}
        label="IPO"
        defaultValue={pDefVal(ipo, ipos)}
      />
      <Select
        options={statuses}
        onChange={handleSelectChange("status")}
        label="Status"
        defaultValue={pDefVal(status, statuses)}
      />
      <div className="d-flex justify-content-end">
        <Button className="pwc px-5" type="submit" loading={submitting}>
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
  label: capitalCase(value),
  value
}));

const typeOfControls = Object.entries(TypeOfControl).map(([label, value]) => ({
  label: capitalCase(value),
  value
}));

const natures = Object.entries(Nature).map(([label, value]) => ({
  label: capitalCase(value),
  value
}));

const ipos = Object.entries(Ipo).map(([label, value]) => ({
  label: capitalCase(value),
  value
}));

const assertions = Object.entries(Assertion).map(([label, value]) => ({
  label: capitalCase(value),
  value
}));

const statuses = Object.entries(Status).map(([label, value]) => ({
  label: capitalCase(value),
  value
}));

// -------------------------------------------------------------------------
// Type Definitions
// -------------------------------------------------------------------------

export interface ControlFormProps {
  defaultValues?: CreateControlFormValues;
  onSubmit?: (val: CreateControlFormValues) => void;
  submitting?: boolean;
}

export interface CreateControlFormValues {
  controlOwner: string;
  typeOfControl: TypeOfControl;
  frequency: Frequency;
  nature: Nature;
  ipo: Ipo;
  assertion: Assertion;
  description?: string;
  status: Status;
}
type Option = {
  label: string;
  value: string;
};
type Options = Option[];
