import { capitalCase } from "capital-case";
import { startCase } from "lodash";
import React, { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Col, Form, FormGroup, Label, Row } from "reactstrap";
import styled from "styled-components";
import { oc } from "ts-optchain";
import * as yup from "yup";
import PickIcon from "../../../assets/Icons/PickIcon";
import {
  ActivityControl,
  Assertion,
  Frequency,
  Ipo,
  Nature,
  TypeOfControl,
  useAdminRisksQuery,
  useBusinessProcessesQuery,
  useControlsQuery,
  useDepartmentsQuery,
} from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import DialogButton from "../../../shared/components/DialogButton";
import Input from "../../../shared/components/forms/Input";
import Select, { FormSelect } from "../../../shared/components/forms/Select";
import CheckBox2 from "../../../shared/components/forms/TestNewCheckBox";
import Modal from "../../../shared/components/Modal";
import Table from "../../../shared/components/Table";
import { toBase64, toLabelValue } from "../../../shared/formatter";
import { PwcRadioInput } from "../../report/Report";

const ControlForm = ({
  onSubmit,
  setModal,
  defaultValues,
  submitting,
  toggleEditMode,
  history,
  isDraft,
  isCreate,
}: ControlFormProps) => {
  const { register, handleSubmit, setValue, errors, watch } = useForm<
    CreateControlFormValues
  >({ validationSchema, defaultValues });
  const controlsQ = useControlsQuery({
    skip: defaultValues?.description ? false : true,
    fetchPolicy: "network-only",
    variables: { filter: { description_eq: defaultValues?.description } },
  });
  const getAssertion =
    controlsQ.data?.navigatorControls?.collection
      .map((a) => a.assertion)
      .flat(2) || [];
  const getIPO =
    controlsQ.data?.navigatorControls?.collection.map((a) => a.ipo).flat(2) ||
    [];
  const [isOpen, setIsOpen] = useState(false);
  const toogleModal = () => setIsOpen((p) => !p);
  const closeModal = () => {
    setIsOpen(false);
    setSelectActivity("");
  };
  const [selectActivity, setSelectActivity] = useState("");
  const [deleteActivity, setDeleteActivity] = useState<MyCoolControlActivity[]>(
    []
  );

  const risksQ = useAdminRisksQuery();
  const riskOptions = oc(risksQ)
    .data.preparerRisks.collection([])
    .map((risk) => ({ label: risk.name || "", value: risk.id }));
  const checkRisk = watch("riskIds") || [];
  const bpsQ = useBusinessProcessesQuery({
    skip: checkRisk.length ? false : true,
    variables: { filter: { risks_id_in: checkRisk } },
  });
  const ultimateBp =
    risksQ.data?.preparerRisks?.collection.filter((a) =>
      checkRisk.includes(a.id)
    ) || [];

  const groupedBpOptions = ultimateBp.map((a) => {
    return {
      label: a.name,
      options: oc(bpsQ.data)
        .navigatorBusinessProcesses.collection([])
        .map((b) => {
          return {
            risks: b.risks?.map((c) => {
              if (c.id === a.id) {
                return 1;
              } else {
                return 0;
              }
            }),
            label: b.name,
            value: b.id,
          };
        })
        .filter((d) => d.risks?.includes(1))
        .map((z) => {
          return { label: z.label || "", value: z.value };
        }),
    };
  });

  const bpOptions = oc(bpsQ)
    .data.navigatorBusinessProcesses.collection([])
    .map(toLabelValue);

  const departments = useDepartmentsQuery();
  const controlOwnerOptions = oc(departments)
    .data.departments.collection([])
    .map(toLabelValue);

  useEffect(() => {
    register({ name: "frequency" });
    register({ name: "typeOfControl" });
    register({ name: "nature" });
    register({ name: "assertion" });
    register({ name: "ipo" });
    register({ name: "activityTitle" });
    register({ name: "activity" });
  }, [register]);

  const handleSelectChange = (name: keyof CreateControlFormValues) => ({
    value,
  }: any) => setValue(name, value);

  const pDefVal = (value: any, options: Options) => {
    return options.find((opt) => opt.value === value);
  };
  const controlOwnerId = oc(defaultValues).controlOwner() || [];
  const description = oc(defaultValues).description("");
  const typeOfControl = oc(defaultValues).typeOfControl();
  const frequency = oc(defaultValues).frequency();
  const nature = oc(defaultValues).nature();
  const activityControls = oc(defaultValues).activityControls() || [];
  const [cool, setCool] = useState<MyCoolControlActivity[]>(() =>
    activityControls.map(transformActivityControl)
  );

  const submit = (values: CreateControlFormValues) => {
    const prepare = beforeSubmit(cool).concat(deleteActivity);
    onSubmit?.({
      ...values,
      activityControlsAttributes: prepare,
    });
    // if (prepare.length) {
    // } else {
    //   toast.error("Add Control Activity is a required field");
    // }
  };

  function handleActivitySubmit(values: MyCoolControlActivity) {
    // update
    const id = cool.filter((c) => String(c.id) === selectActivity);
    if (id.length > 0) {
      setCool((cool) =>
        cool.map((c) => {
          if (String(c.id) === selectActivity) {
            return {
              ...values,
              id: c.id,
            };
          }
          return c;
        })
      );
    } else {
      setCool((cool) =>
        cool.concat({
          ...values,
          id: "temp" + randomId(1000),
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
    const deleted = cool.find((c) => String(c.id) === String(id));
    if (String(deleted?.id).includes("temp")) {
    } else {
      const temp = {
        id: deleted?.id,
        activity: deleted?.activity,
        guidance: deleted?.guidance,
        _destroy: 1,
      };
      setDeleteActivity(deleteActivity.concat(temp));
    }
    setCool(cool.filter((c) => c.id !== id));
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
          {isCreate ? (
            <StyledDialogButton
              className="cancel black px-5 ml-2 mb-3"
              onConfirm={
                setModal
                  ? () => setModal(false)
                  : () => history.replace(`/control`)
              }
              isCreate
            >
              Cancel
            </StyledDialogButton>
          ) : (
            <StyledDialogButton
              className="cancel black px-5 ml-2 mb-3"
              onConfirm={setModal ? () => setModal(false) : toggleEditMode}
              isEdit
            >
              Cancel
            </StyledDialogButton>
          )}
        </div>
      );
    }
  };

  return (
    <Fragment>
      <Form onSubmit={handleSubmit(submit)}>
        <Input
          name="description"
          label="Description*"
          placeholder="Description"
          innerRef={register}
          error={errors.description && "Description is a required field"}
        />

        <FormSelect
          isMulti
          name="riskIds"
          label="Risks*"
          placeholder="Risks"
          isLoading={risksQ.loading}
          register={register}
          setValue={setValue}
          options={riskOptions}
          loading={risksQ.loading}
          defaultValue={riskOptions.filter((res) =>
            oc(defaultValues)
              .riskIds([])
              .includes(res.value)
          )}
          error={errors.riskIds && "Risks is a required field"}
        />

        <FormSelect
          isMulti
          isDisabled={checkRisk.length ? false : true}
          name="businessProcessIds"
          label="Business processes*"
          placeholder="Business processes"
          isLoading={bpsQ.loading}
          register={register}
          setValue={setValue}
          options={groupedBpOptions}
          loading={bpsQ.loading}
          defaultValue={bpOptions.filter((res) =>
            oc(defaultValues)
              .businessProcessIds([])
              .includes(res.value)
          )}
          error={
            errors.businessProcessIds && "Business Process is a required field"
          }
        />

        <FormGroup check className="mb-3">
          <CheckBox2
            name="keyControl"
            innerRef={register}
            id="keyControlCheckbox"
          />
          <Label className="ml-2" for="keyControlCheckbox" check>
            Key control
          </Label>
        </FormGroup>

        <Select
          options={newLabelTypeOfControls}
          onChange={handleSelectChange("typeOfControl")}
          label="Type of controls*"
          placeholder="Type of controls"
          defaultValue={pDefVal(typeOfControl, typeOfControls)}
          error={errors.typeOfControl && "Type of Controls is a required field"}
        />

        <Select
          options={frequencies}
          onChange={handleSelectChange("frequency")}
          placeholder="Frequency"
          label="Frequency*"
          defaultValue={pDefVal(frequency, frequencies)}
          error={errors.frequency && "Frequency is a required field"}
        />

        <Select
          options={natures}
          placeholder="Nature"
          onChange={handleSelectChange("nature")}
          label="Nature*"
          defaultValue={pDefVal(nature, natures)}
          error={errors.nature && "Nature is a required field"}
        />
        <Row form>
          <Col md={6}>
            <FormSelect
              isMulti
              name="assertion"
              label="Assertions*"
              placeholder="Assertions"
              loading={controlsQ.loading}
              register={register}
              setValue={setValue}
              options={assertions}
              defaultValue={assertions.filter((res) =>
                getAssertion.includes(res.value)
              )}
              error={errors.assertion && "Assertion is a required field"}
            />
          </Col>
          <Col md={6}>
            <FormSelect
              isMulti
              name="ipo"
              label="IPOs"
              placeholder="IPOs"
              loading={controlsQ.loading}
              register={register}
              setValue={setValue}
              options={newLabelIPOs}
              defaultValue={ipos.filter((res) => getIPO.includes(res.value))}
              // error={errors.ipo && "IPOs is a required field"}
            />
          </Col>
        </Row>

        <FormSelect
          isMulti
          name="controlOwner"
          label="Control owner*"
          placeholder="Control owner"
          register={register}
          setValue={setValue}
          options={controlOwnerOptions}
          defaultValue={controlOwnerOptions.filter((a) =>
            controlOwnerId.includes(a.value)
          )}
          loading={departments.loading}
          error={errors.controlOwner && "Control owner is a required field"}
        />
        <span>Control activites</span>
        <div className="mt-2">
          <Button
            type="button"
            className="pwc mb-2"
            onClick={toogleModal}
            // color=""
          >
            Add control activity
          </Button>
        </div>
        {cool.length === 0 ? null : (
          <Table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Guidance</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cool.map((activity) => (
                <tr key={"Row" + activity.id}>
                  <td className="wrapped" style={{width: '42.5%'}}>{activity.activity}</td>
                  <td className="wrapped" style={{width: '42.5%'}}>
                    {activity.resuploadFileName
                      ? activity.resuploadFileName?.toString()
                      : activity.guidance}
                  </td>
                  <td className="action" style={{width: '15%'}}>
                    <Button
                      onClick={() => handleEdit(activity.id)}
                      className="soft red mr-2"
                    >
                      <PickIcon name="pencilFill" style={{ width: "15px" }} />
                    </Button>
                    <DialogButton
                      onConfirm={() => handleDelete(activity.id)}
                      message={`Delete "${activity.activity}"?`}
                      className="soft red"
                    >
                      <PickIcon name="trash" className="clickable" />
                    </DialogButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {renderSubmit()}
      </Form>
      <Modal isOpen={isOpen} toggle={closeModal} title="Add control activity">
        <ActivityModalForm
          activityDefaultValue={cool.find(
            (c) => String(c.id) === selectActivity
          )}
          onSubmit={handleActivitySubmit}
        />
      </Modal>
    </Fragment>
  );
};

const transformActivityControl = (
  input: Partial<ActivityControl>
): MyCoolControlActivity => {
  const output = {
    activity: input.activity,
    guidance: input.guidance,
    id: Number(input.id),
    resuploadFileName: input.guidanceFileName,
  };
  return output;
};

const beforeSubmit = (input: MyCoolControlActivity[]) => {
  const output: MyCoolControlActivity[] = input.map((data) => {
    const { resuploadFileName, resupload, ...theRest } = data;
    if (String(theRest.id).includes("temp")) {
      const { id, ...rest } = theRest;
      if (resupload)
        return { ...rest, resupload, resupload_file_name: resuploadFileName };
      return rest;
    } else {
      if (resupload)
        return {
          ...theRest,
          resupload,
          resupload_file_name: resuploadFileName,
        };
      else return theRest;
    }
  });

  return output;
};

const randomId = (max: number) => {
  return Math.floor(Math.random() * Math.floor(max));
};

const ActivityModalForm = ({
  activityDefaultValue,
  onSubmit,
}: ActivityControlModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const [activityType, setActivityType] = useState(
    activityDefaultValue?.resupload ? "attachment" : "text"
  );
  const { register, handleSubmit, setValue, errors } = useForm<
    MyCoolControlActivity
  >({
    // validationSchema: validationSchemaControlActivity,
    defaultValues: activityDefaultValue,
  });

  useEffect(() => {
    register({ name: "resupload", type: "custom" });
    register({ name: "resuploadFileName" });
  }, [register]);

  const handleSaveActivity = (values: MyCoolControlActivity) => {
    onSubmit({
      activity: values.activity,
      resupload: values.resupload,
      guidance: values.guidance || "",
      resuploadFileName: values.resuploadFileName,
    });
  };

  async function handleSetFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (
        ![
          'application/vnd.ms-excel',
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/pdf",
          'application/msword',
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(file.type)
      ) {
        setError("File type not supported. Allowed type are: PDF, Excel, Word");
      } else {
        setError(null);
        setValue("resuploadFileName", file.name);
        setValue("resupload", String(await toBase64(file)), true);
      }
    }
  }

  return (
    <Form onSubmit={handleSubmit(handleSaveActivity)}>
      <Input
        name="activity"
        label="Control activity title"
        required
        placeholder="Title..."
        innerRef={register}
        error={errors.activity && "Activity is a required field"}
        type="textarea"
      />
      <span className="mt-2 mb-3">Control activity guidance</span>
      <div className="d-flex ml-3">
        <Label check className="d-flex align-items-center pr-4">
          <PwcRadioInput
            type="radio"
            name="controlActivity_type"
            value="text"
            onChange={() => setActivityType("text")}
            defaultChecked={activityType === "text"}
          />{" "}
          Free text
        </Label>
        <Label check className="d-flex align-items-center pl-3">
          <PwcRadioInput
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
          <Input
            type="textarea"
            name="guidance"
            innerRef={register}
            placeholder="Description..."
          />
        ) : (
          <Fragment>
            <Input
              type="file"
              onChange={activityType === "attachment" ? handleSetFile : () => {}}
            />
            <div
              style={{ fontSize: '12px' }}
              className="mt-lg-n2 font-italic text-danger"
            >
              Note: Maximum attachment file size 50 Mb
            </div>
          </Fragment>
        )}
      </div>
      {error && <h6 className="text-red mt-2">{error}</h6>}
      <div className="d-flex justify-content-end">
        <Button className="pwc" type="submit">
          {activityDefaultValue?.id ? "Update Activity" : "Add Activity"}
        </Button>
      </div>
    </Form>
  );
};

export default ControlForm;

// -------------------------------------------------------------------------
// Construct Options
// -------------------------------------------------------------------------

const newLabelTypeOfControls = [
  {label: "Automatic", value: "automatic"},
  {label: "Manual", value: "manual"},
  {label: "IT Dependent Manual", value: "it_dependent_manual"},
  {label: "Manual SSC", value: "manual_ssc"},
  {label: "Manual SDC", value: "manual_sdc"}
];

const newLabelIPOs = [
  {label: "Completeness", value: "completeness"},
  {label: "Accuracy", value: "accuracy"},
  {label: "Validity", value: "validation"},
  {label: "Restriction Access (CAVR)", value: "restriction"}
]

const frequencies = Object.entries(Frequency).map(([label, value]) => ({
  label: capitalCase(value),
  value,
}));

const typeOfControls = Object.entries(TypeOfControl).map(([label, value]) => ({
  label: capitalCase(value),
  value,
}));

const natures = Object.entries(Nature).map(([label, value]) => ({
  label: capitalCase(value),
  value,
}));

const ipos = Object.entries(Ipo).map(([label, value]) => ({
  label: startCase(value.split("_").join(" ")),
  value,
}));
const assertions = Object.entries(Assertion).map(([label, value]) => {
  return { label: startCase(value.split("_").join(" ")), value };
});

const StyledDialogButton = styled(DialogButton)`
  background: var(--soft-grey);
`;

// -------------------------------------------------------------------------
// Type Definitions
// -------------------------------------------------------------------------

export interface ControlFormProps {
  defaultValues?: ControlFormValues;
  setModal?: any;
  onSubmit?: (val: CreateControlFormValues) => void;
  submitting?: boolean;
  isDraft?: boolean;
  toggleEditMode?: any;
  isCreate?: boolean;
  history?: any;
}

export interface CreateControlFormValues {
  controlOwner?: any;
  typeOfControl: TypeOfControl;
  frequency: Frequency;
  nature: Nature;
  ipo: Ipo[];
  assertion: Assertion[];
  description?: string | null;
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
// ---------------------------------------------------
// Validation
// ---------------------------------------------------

const validationSchema = yup.object().shape({
  typeOfControl: yup.string().required(),
  description: yup.string().required(),
  riskIds: yup.array().required(),
  frequency: yup.string().required(),
  // ipo: yup.array().required(),
  assertion: yup.array().required(),
  nature: yup.string().required(),
  controlOwner: yup.array().required(),
  businessProcessIds: yup.array().required(),
});

// const validationSchemaControlActivity = yup.object().shape({
//   activity: yup.string().required(),
// });
// export interface CreateActivityControlFormValues {
//   activity: string;
//   guidance: string;
// }
