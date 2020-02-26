import { capitalCase } from "capital-case";
import React, { Fragment, useEffect, useState } from "react";
import useForm from "react-hook-form";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Col, Form, FormGroup, Input as BsInput, Label, Row } from "reactstrap";
import { oc } from "ts-optchain";
import {
  ActivityControl,
  Assertion,
  Frequency,
  Ipo,
  Nature,
  Status,
  TypeOfControl,
  useBusinessProcessesQuery,
  useRisksQuery
} from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import DialogButton from "../../../shared/components/DialogButton";
import Input from "../../../shared/components/forms/Input";
import Select, { FormSelect } from "../../../shared/components/forms/Select";
import Modal from "../../../shared/components/Modal";
import Table from "../../../shared/components/Table";
import { toLabelValue } from "../../../shared/formatter";

const ControlForm = ({
  onSubmit,
  defaultValues,
  submitting,
  isDraft
}: ControlFormProps) => {
  const { register, handleSubmit, setValue } = useForm<CreateControlFormValues>(
    { defaultValues }
  );
  const [isOpen, setIsOpen] = useState(false);
  const toogleModal = () => setIsOpen(p => !p);
  const [selectActivity, setSelectActivity] = useState(null);

  const bpsQ = useBusinessProcessesQuery();
  const bpOptions = oc(bpsQ)
    .data.businessProcesses.collection([])
    .map(toLabelValue);

  const risksQ = useRisksQuery();
  const riskOptions = oc(risksQ)
    .data.risks.collection([])
    .map(risk => ({ label: risk.name || "", value: risk.id }));

  useEffect(() => {
    register({ name: "frequency" });
    register({ name: "typeOfControl" });
    register({ name: "nature" });
    register({ name: "assertion" });
    register({ name: "ipo" });
    register({ name: "status" });
    register({ name: "activityTitle" });
    register({ name: "activity" });
  }, [register]);

  const handleSelectChange = (name: keyof CreateControlFormValues) => ({
    value
  }: any) => setValue(name, value);

  const pDefVal = (value: any, options: Options) => {
    return options.find(opt => opt.value === value);
  };

  const description = oc(defaultValues).description("");
  const typeOfControl = oc(defaultValues).typeOfControl();
  const frequency = oc(defaultValues).frequency();
  const nature = oc(defaultValues).nature();
  const status = oc(defaultValues).status();
  const activityControls = oc(defaultValues).activityControls() || [];

  // const cool: MyCoolControlActivity[] = activityControls.map(susah)

  const [cool, setCool] = useState<MyCoolControlActivity[]>(() =>
    activityControls.map(susah)
  );

  const submit = (values: CreateControlFormValues) => {
    onSubmit &&
      onSubmit({
        ...values,
        activityControlsAttributes: cool
      });
  };

  function handleActivitySubmit(values: MyCoolControlActivity) {
    // update
    if (values.id) {
      setCool(cool =>
        cool.map(c => {
          if (c.id === values.id) {
            return values;
          }
          return c;
        })
      );
    } else {
      //create
      setCool(cool => cool.concat(values));
    }
    setIsOpen(false);
  }

  const renderSubmit = () => {
    if (!isDraft) {
      return (
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
      );
    }
  };
  console.log("testes", cool);

  return (
    <Fragment>
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
        <span>Control Activites</span>
        <div className="mt-2">
          <Button
            type="button"
            className="soft orange mb-2"
            onClick={toogleModal}
          >
            Add
          </Button>
        </div>
        {cool.length === 0 ? null : (
          <Table>
            <thead>
              <tr>
                <th>Activity</th>
                <th>Guidance</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cool?.map(activity => (
                <tr key={activity.id}>
                  <td>{activity.activity}</td>
                  <td>{activity.guidance}</td>
                  <td className="action">
                    <DialogButton
                      // onConfirm={() => handleDelete(control.id)}
                      // loading={destroyM.loading}
                      message={`Delete "${activity.activity}"?`}
                      className="soft red mr-2"
                    >
                      <FaPencilAlt className="clickable" />
                    </DialogButton>
                    <DialogButton
                      // onConfirm={() => handleDelete(control.id)}
                      // loading={destroyM.loading}
                      message={`Delete "${activity.activity}"?`}
                      className="soft red"
                    >
                      <FaTrash className="clickable" />
                    </DialogButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {renderSubmit()}
      </Form>
      <ActivityModal
        isOpen={isOpen}
        toogleModal={toogleModal}
        activityDefaultValue={cool.find(c => c.id === selectActivity)}
        onSubmit={handleActivitySubmit}
      />
    </Fragment>
  );
};

const susah = (input: Partial<ActivityControl>): MyCoolControlActivity => {
  const output = {
    activity: input.activity,
    guidance: input.guidance
  };
  return output;
};

const ActivityModal = ({
  isOpen,
  toogleModal,
  activityDefaultValue,
  onSubmit
}: ActivityControlModalProps) => {
  const [activityType, setActivityType] = useState("text");
  const { register, handleSubmit } = useForm<MyCoolControlActivity>();

  const handleSaveActivity = (values: MyCoolControlActivity) => {
    console.log("apa si", values);
    onSubmit(values);
  };
  return (
    <Modal isOpen={isOpen} toggle={toogleModal} title="Add Control Activity">
      <Form onSubmit={handleSubmit(handleSaveActivity)}>
        <Input
          name="activity"
          label="Activity Control Title"
          required
          innerRef={register}
        />
        <span className="mt-2 mb-3">Activity Control Guidance</span>
        <div className="d-flex ml-3">
          <Label check className="d-flex align-items-center pr-4">
            <Input
              type="radio"
              name="controlActivity_type"
              value="text"
              onChange={() => setActivityType("text")}
              defaultChecked={activityType === "text"}
            />{" "}
            Free text
          </Label>
          <Label check className="d-flex align-items-center pl-3">
            <Input
              type="radio"
              name="controlActivity_type"
              value="attachment"
              onChange={() => setActivityType("attachment")}
              defaultChecked={activityType === "attachment"}
            />{" "}
            Attachment
          </Label>
        </div>
        <div className="mt-1">
          {activityType === "text" ? (
            <Input name="guidance" innerRef={register} />
          ) : activityType === "attachment" ? (
            <Input
              type="file"
              name="guidance"
              innerRef={register}
              // onChange={handleSetFile}
            />
          ) : null}
        </div>
        <div>
          <Button className="pwc" type="submit">
            Add Activity
          </Button>
        </div>
      </Form>
    </Modal>
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
  defaultValues?: ControlFormValues;
  onSubmit?: (val: CreateControlFormValues) => void;
  submitting?: boolean;
  isDraft?: boolean;
}

export interface CreateControlFormValues {
  controlOwner: string;
  typeOfControl: TypeOfControl;
  frequency: Frequency;
  nature: Nature;
  ipo: Ipo[];
  assertion: Assertion[];
  description?: string | null;
  status: Status;
  riskIds: string[];
  businessProcessIds: string[];
  keyControl: boolean;
  activityControlsAttributes: MyCoolControlActivity[] | null | undefined;
}

export type CreateControlFormDefaultValues = Omit<
  Partial<CreateControlFormValues>,
  "activityControlsAttributes"
>;

export interface ControlFormValues extends CreateControlFormDefaultValues {
  activityControls: Partial<ActivityControl>[] | null | undefined;
}

type Option = {
  label: string;
  value: string;
};

type Options = Option[];

interface ActivityControlModalProps {
  isOpen: boolean;
  toogleModal: () => void;
  activityDefaultValue?: MyCoolControlActivity | null;
  onSubmit: (Activity: MyCoolControlActivity) => void;
}

interface MyCoolControlActivity {
  _destroy?: boolean;
  id?: string | number;
  activity?: string | null;
  guidance?: string | null;
}

// export interface CreateActivityControlFormValues {
//   activity: string;
//   guidance: string;
// }
