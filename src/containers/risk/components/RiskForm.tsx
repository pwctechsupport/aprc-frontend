import React, { useEffect } from "react";
import useForm from "react-hook-form";
import { Form } from "reactstrap";
import { oc } from "ts-optchain";
import * as yup from "yup";
import { LevelOfRisk, Status } from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/forms/Input";
import Select from "../../../shared/components/forms/Select";
import { capitalCase } from "capital-case";

const RiskForm = ({ onSubmit, defaultValues, submitting }: RiskFormProps) => {
  const { register, setValue, errors, handleSubmit } = useForm<RiskFormValues>({
    validationSchema,
    defaultValues
  });

  useEffect(() => {
    register({ name: "levelOfRisk", required: true });
    register({ name: "status", required: true });
  }, [register]);

  const handleChange = (name: string) => ({ value }: any) => {
    setValue(name, value);
  };

  const submit = (values: RiskFormValues) => {
    onSubmit && onSubmit(values);
  };

  const levelOfRisk = oc(defaultValues).levelOfRisk();
  const status = oc(defaultValues).status();

  return (
    <div>
      <Form onSubmit={handleSubmit(submit)}>
        <Input
          name="name"
          label="Name"
          innerRef={register({ required: true })}
          error={errors.name && errors.name.message}
        />
        <Select
          name="levelOfRisk"
          label="Level of Risk"
          options={levelOfRisks}
          innerRef={register({ required: true })}
          onChange={handleChange("levelOfRisk")}
          error={errors.levelOfRisk && errors.levelOfRisk.message}
          defaultValue={levelOfRisks.find(
            option => option.value === levelOfRisk
          )}
        />
        <Select
          name="status"
          label="Status"
          options={statuses}
          innerRef={register({ required: true })}
          onChange={handleChange("status")}
          error={errors.status && errors.status.message}
          defaultValue={statuses.find(option => option.value === status)}
        />
        <div className="d-flex justify-content-end">
          <Button className="pwc px-5" type="submit" loading={submitting}>
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default RiskForm;

// -------------------------------------------------------------------------
// Construct Options
// -------------------------------------------------------------------------

const levelOfRisks = Object.entries(LevelOfRisk).map(([label, value]) => ({
  label,
  value
}));

const statuses = Object.entries(Status).map(([label, value]) => ({
  label: capitalCase(value),
  value
}));

// -------------------------------------------------------------------------
// Validation Schema
// -------------------------------------------------------------------------

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  levelOfRisk: yup.string().required(),
  status: yup.string().required()
});

// -------------------------------------------------------------------------
// Type Definitions
// -------------------------------------------------------------------------

export interface RiskFormValues {
  name: string;
  levelOfRisk: LevelOfRisk;
  status: Status;
}

export interface RiskFormProps {
  onCancel?: () => void;
  onSubmit?: (data: RiskFormValues) => void;
  submitting?: boolean;
  defaultValues?: RiskFormValues;
}
