import { capitalCase } from "capital-case";
import React, { useEffect } from "react";
import useForm from "react-hook-form";
import { Col, Form, FormGroup, Input as BsInput, Label, Row } from "reactstrap";
import { oc } from "ts-optchain";
import {
  Assertion,
  Frequency,
  Ipo,
  Nature,
  Status,
  TypeOfControl,
  useBusinessProcessesQuery,
  useRisksQuery
} from "../../../generated/graphql";
import DialogButton from "../../../shared/components/DialogButton";
import Input from "../../../shared/components/forms/Input";
import Select, { FormSelect } from "../../../shared/components/forms/Select";

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

  const bpsQ = useBusinessProcessesQuery();
  const bpOptions = oc(bpsQ)
    .data.businessProcesses.collection([])
    .map(bp => ({ label: bp.name, value: bp.id }));

  const risksQ = useRisksQuery();
  const riskOptions = oc(risksQ)
    .data.risks.collection([])
    .map(risk => ({ label: risk.name, value: risk.id }));

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

  const description = oc(defaultValues).description("");
  const typeOfControl = oc(defaultValues).typeOfControl();
  const frequency = oc(defaultValues).frequency();
  const nature = oc(defaultValues).nature();
  const status = oc(defaultValues).status();

  return (
    <Form onSubmit={handleSubmit(submit)}>
      <Input name="description" label="Description" innerRef={register} />

      <FormSelect
        isMulti
        name="riskIds"
        label="Risks"
        isLoading={risksQ.loading}
        register={register}
        setValue={setValue}
        options={riskOptions}
        loading={risksQ.loading}
        defaultValue={riskOptions.filter(res =>
          oc(defaultValues)
            .riskIds([])
            .includes(res.value)
        )}
      />

      <FormGroup check className="mb-3">
        <BsInput
          type="checkbox"
          name="keyControl"
          id="keyControlCheckbox"
          innerRef={register}
        />
        <Label for="keyControlCheckbox" check>
          Key Control
        </Label>
      </FormGroup>

      <Select
        options={typeOfControls}
        onChange={handleSelectChange("typeOfControl")}
        label="Type of Controls"
        defaultValue={pDefVal(typeOfControl, typeOfControls)}
      />

      <FormSelect
        isMulti
        name="businessProcessIds"
        label="Business Processes"
        isLoading={bpsQ.loading}
        register={register}
        setValue={setValue}
        options={bpOptions}
        loading={risksQ.loading}
        defaultValue={bpOptions.filter(res =>
          oc(defaultValues)
            .businessProcessIds([])
            .includes(res.value)
        )}
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

      <Row form>
        <Col md={6}>
          <FormSelect
            isMulti
            name="assertion"
            label="Assertions"
            register={register}
            setValue={setValue}
            options={assertions}
            defaultValue={assertions.filter(res =>
              oc(defaultValues)
                .assertion([])
                .includes(res.value)
            )}
          />
        </Col>
        <Col md={6}>
          <FormSelect
            isMulti
            name="ipo"
            label="IPOs"
            register={register}
            setValue={setValue}
            options={ipos}
            defaultValue={ipos.filter(res =>
              oc(defaultValues)
                .ipo([])
                .includes(res.value)
            )}
          />
        </Col>
      </Row>
      <Input name="controlOwner" label="Control Owner" innerRef={register} />
      <Select
        options={statuses}
        onChange={handleSelectChange("status")}
        label="Status"
        defaultValue={pDefVal(status, statuses)}
      />

      <div className="d-flex justify-content-end">
        <DialogButton
          onConfirm={handleSubmit(submit)}
          className="pwc px-5 mb-3"
          type="button"
          loading={submitting}
          color="primary"
          message={
            description
              ? `Save your changes on control "${description}"?`
              : "Create new control?"
          }
        >
          Submit
        </DialogButton>
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
  defaultValues?: CreateControlFormDefaultValues;
  onSubmit?: (val: CreateControlFormValues) => void;
  submitting?: boolean;
}

export interface CreateControlFormValues {
  controlOwner: string;
  typeOfControl: TypeOfControl;
  frequency: Frequency;
  nature: Nature;
  ipo: Ipo[];
  assertion: Assertion[];
  description?: string;
  status: Status;
  riskIds: string[];
  businessProcessIds: string[];
  keyControl: boolean;
}

export type CreateControlFormDefaultValues = Partial<CreateControlFormValues>;

type Option = {
  label: string;
  value: string;
};

type Options = Option[];
