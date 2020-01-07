import { capitalCase } from "capital-case";
import React, { useEffect } from "react";
import useForm from "react-hook-form";
import { Form } from "reactstrap";
import { oc } from "ts-optchain";
import * as yup from "yup";
import {
  LevelOfRisk,
  Status,
  TypeOfRisk,
  useBusinessProcessesQuery
} from "../../../generated/graphql";
import DialogButton from "../../../shared/components/DialogButton";
import Input from "../../../shared/components/forms/Input";
import Select from "../../../shared/components/forms/Select";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";
import { prepDefaultValue } from "../../../shared/formatter";

const RiskForm = ({ onSubmit, defaultValues, submitting }: RiskFormProps) => {
  const bussinessProcessesQ = useBusinessProcessesQuery();
  const { register, setValue, errors, handleSubmit } = useForm<RiskFormValues>({
    validationSchema,
    defaultValues
  });

  useEffect(() => {
    register({ name: "levelOfRisk", required: true });
    register({ name: "status", required: true });
    register({ name: "businessProcessId" });
    register({ name: "typeOfRisk" });
  }, [register]);

  const handleChange = (name: string) => ({ value }: any) => {
    setValue(name, value);
  };

  const submit = (values: RiskFormValues) => {
    onSubmit && onSubmit(values);
  };

  const name = oc(defaultValues).name();
  const levelOfRisk = oc(defaultValues).levelOfRisk();
  const status = oc(defaultValues).status();
  const businessProcessId = oc(defaultValues).businessProcessId();
  const typeOfRisk = oc(defaultValues).typeOfRisk();

  if (bussinessProcessesQ.loading) return <LoadingSpinner size={30} centered />;

  const businessProcesses = oc(bussinessProcessesQ)
    .data.businessProcesses.collection([])
    .map(bp => ({
      label: bp.name,
      value: bp.id
    }));

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
          onChange={handleChange("status")}
          error={errors.status && errors.status.message}
          defaultValue={statuses.find(option => option.value === status)}
        />
        <Select
          name="businessProcessId"
          label="Business Process"
          options={businessProcesses}
          onChange={handleChange("businessProcessId")}
          error={errors.businessProcessId && errors.businessProcessId.message}
          defaultValue={businessProcesses.find(
            option => option.value === businessProcessId
          )}
        />
        <Select
          name="typeOfRisk"
          label={capitalCase("typeOfRisk")}
          options={typeOfRisks}
          onChange={handleChange("typeOfRisk")}
          error={oc(errors).typeOfRisk.message("")}
          defaultValue={prepDefaultValue(typeOfRisk, typeOfRisks)}
        />
        <div className="d-flex justify-content-end">
          <DialogButton
            onConfirm={handleSubmit(submit)}
            className="pwc px-5"
            type="button"
            color="primary"
            loading={submitting}
            message={name ? `Save changes on "${name}"?` : "Create new risk?"}
          >
            Submit
          </DialogButton>
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

const typeOfRisks = Object.entries(TypeOfRisk).map(([label, value]) => ({
  label: capitalCase(value),
  value
}));

// -------------------------------------------------------------------------
// Validation Schema
// -------------------------------------------------------------------------

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  levelOfRisk: yup.string().required(),
  status: yup.string().required(),
  typeOfRisk: yup.string()
});

// -------------------------------------------------------------------------
// Type Definitions
// -------------------------------------------------------------------------

export interface RiskFormValues {
  name: string;
  levelOfRisk: LevelOfRisk;
  status: Status;
  businessProcessId?: string;
  typeOfRisk?: TypeOfRisk;
}

export type RiskFormDefaultValues = Partial<RiskFormValues>;

export interface RiskFormProps {
  onCancel?: () => void;
  onSubmit?: (data: RiskFormValues) => void;
  submitting?: boolean;
  defaultValues?: RiskFormDefaultValues;
}
