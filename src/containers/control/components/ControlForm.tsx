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
import { AiFillEdit } from "react-icons/ai";
import {
  toBase64
} from "../../../shared/formatter";

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
  const closeModal = () => {
    setIsOpen(false);
    setSelectActivity("");
  };
  const [selectActivity, setSelectActivity] = useState("");
  const [deleteActivity, setDeleteActivity] = useState<MyCoolControlActivity[]>([]);
  
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

  const [cool, setCool] = useState<MyCoolControlActivity[]>(() =>
    activityControls.map(susah)
  );

  const submit = (values: CreateControlFormValues) => {
    const prepare = beforeSubmit(cool).concat(deleteActivity)
    console.log("mau dikirim", prepare)

    onSubmit &&
      onSubmit({
        ...values,
        activityControlsAttributes: prepare
      });
  };

  function handleActivitySubmit(values: MyCoolControlActivity) {
    // update
    console.log("test", values)
    const id = cool.filter(c => String(c.id) === selectActivity);
    console.log(id);
    if (id.length > 0) {
      console.log("update");
      setCool(cool =>
        cool.map(c => {
          if (String(c.id) === selectActivity) {
            console.log("Aa");
            return {
              ...values,
              id: c.id
            };
          }
          return c;
        })
      );
    } else {
      setCool(cool =>
        cool.concat({
          ...values,
          id: "temp" + randomId(1000)
        })
      );
    }
    setSelectActivity("");
    setIsOpen(false);
  }

  const handleEdit = (id?: string | number) => {
    setSelectActivity(String(id));
    setIsOpen(true);
  };

  const handleDelete = (id?: string | number) => {
    console.log("huh", id);
    const deleted = cool.find(c => String(c.id) === String(id))
    if(String(deleted?.id).includes("temp")){}
    else{
      const temp = {
        id: deleted?.id,
  activity: deleted?.activity,
  guidance: deleted?.guidance,
        _destroy: 1
      }
      setDeleteActivity(deleteActivity.concat(temp))
    }
    setCool(cool.filter(c => c.id !== id));
  };

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
              {cool.map(activity => (
                <tr key={"Row" + activity.id}>
                  <td>{activity.activity}</td>
                  <td>{activity.guidance ? activity.guidance : activity.resuploadFileName}</td>
                  <td className="action">
                    <Button
                      onClick={() => handleEdit(activity.id)}
                      className="soft red mr-2"
                    >
                      <AiFillEdit />
                    </Button>
                    <DialogButton
                      onConfirm={() => handleDelete(activity.id)}
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
      <Modal isOpen={isOpen} toggle={closeModal} title="Add Control Activity">
        <ActivityModalForm
          activityDefaultValue={cool.find(c => String(c.id) === selectActivity)}
          onSubmit={handleActivitySubmit}
        />
      </Modal>
    </Fragment>
  );
};

const susah = (input: Partial<ActivityControl>): MyCoolControlActivity => {
  const output = {
    activity: input.activity,
    guidance: input.guidance,
    id: Number(input.id),
    resuploadFileName: input.guidanceFileName
  };
  return output;
};

const beforeSubmit = (input: MyCoolControlActivity[]) => {
  const output:MyCoolControlActivity[] = input.map(data => {
    const {resuploadFileName, resupload, ...theRest} = data
    if(String(theRest.id).includes("temp")){
      const {id, ...rest} = theRest
      if(resupload) return {...rest, resupload, resupload_file_name: resuploadFileName}
      return rest
    } else {
      if(resupload) return {...theRest, resupload, resupload_file_name: resuploadFileName}
      else return theRest}
  })

  return output
}

const randomId = (max: number) => {
  return Math.floor(Math.random() * Math.floor(max));
};

const ActivityModalForm = ({
  activityDefaultValue,
  onSubmit
}: ActivityControlModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const [activityType, setActivityType] = useState(activityDefaultValue?.resupload ? "attachment" : "text");
  const { register, handleSubmit, setValue } = useForm<MyCoolControlActivity>({
    defaultValues: activityDefaultValue
  });

  useEffect(() => {
    register({ name: "resupload", type: "custom" });
    register({ name: "resuploadFileName" });
  }, [register]);

  const handleSaveActivity = (values: MyCoolControlActivity) => {
    console.log("apa si", values);
    onSubmit(values);
  };

  async function handleSetFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (
        !["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type) 
      ) {
        setError("File type not supported. Allowed type are: PDF, Excel, Word");
      } else {
        setError(null);
        setValue("resuploadFileName", file.name);
        setValue(
          "resupload",
          String(await toBase64(file)),
          true
        );
      }
    }
  }

  return (
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
        {activityType === "text" ? <Input
          type="text"
          name="guidance"
          innerRef={register}
        />: <Input
        type="file"
        onChange={activityType === "attachment" ? handleSetFile : () => {console.log("test")}}
      />
        }
      </div>
      {error && <h6 className="text-red mt-2">{error}</h6>}
      <div>
        <Button className="pwc" type="submit">
          {activityDefaultValue?.id ? "Update Activity": "Add Activity"}
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
  activityDefaultValue?: MyCoolControlActivity;
  onSubmit: (Activity: MyCoolControlActivity) => void;
}

interface MyCoolControlActivity {
  _destroy?: number;
  id?: string | number;
  activity?: string | null;
  guidance?: string | null;
  resupload?: string;
  resuploadFileName?: string | null;
}

// export interface CreateActivityControlFormValues {
//   activity: string;
//   guidance: string;
// }
