import { capitalCase } from "capital-case";
import { capitalize } from "lodash";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form } from "reactstrap";
import styled from "styled-components";
import * as yup from "yup";
import {
  LevelOfRisk,
  TypeOfRisk,
  useBusinessProcessesQuery,
} from "../../../generated/graphql";
import DialogButton from "../../../shared/components/DialogButton";
import Input from "../../../shared/components/forms/Input";
import Select, { FormSelect } from "../../../shared/components/forms/Select";
import { prepDefaultValue, toLabelValue } from "../../../shared/formatter";

const RiskForm = ({
  setModal,
  onSubmit,
  defaultValues,
  submitting,
  toggleEditMode,
  history,
  isCreate,
}: RiskFormProps) => {
  const { register, setValue, errors, handleSubmit, watch } = useForm<
    RiskFormValues
  >({
    validationSchema,
    defaultValues,
  });

  useEffect(() => {
    register({ name: "levelOfRisk", required: true });
    register({ name: "typeOfRisk" });
  }, [register]);

  const handleChange = (name: keyof RiskFormValues) => ({ value }: any) => {
    setValue(name, value);
  };

  const submit = (values: RiskFormValues) => {
    onSubmit && onSubmit(values);
  };

  const name = defaultValues?.name;
  const levelOfRisk = defaultValues?.levelOfRisk;
  const businessProcesses = defaultValues?.businessProcessIds || [];
  const typeOfRisk = defaultValues?.typeOfRisk;

  // Business Process Bar
  const mainBps = useBusinessProcessesQuery({
    variables: { filter: { ancestry_null: true } },
  });
  const getBps = mainBps.data?.navigatorBusinessProcesses?.collection || [];
  const handleGetMainBps = getBps.map(toLabelValue);
  const mainBpIds = watch("businessProcessMain");

  const firstBps = useBusinessProcessesQuery({
    skip: !mainBpIds,
    variables: { filter: { ancestry_in: mainBpIds } },
  });

  const getFirstBps =
    firstBps.data?.navigatorBusinessProcesses?.collection || [];

  const handleGetFirstBps = getFirstBps.map(toLabelValue);

  const getFirstBpsChild = getFirstBps
    .map((a) => a.children)
    .flat(2)
    .map((b) => b?.ancestry);

  const firstBpIds = watch("businessProcessFirst") || [];
  const secondBpIds = watch("businessProcessSecond") || [];
  const firstBpIdsWatch = watch("businessProcessFirst");
  const filteredGetFirstBpsChild = getFirstBpsChild.filter((a) => {
    // @ts-ignore
    return firstBpIds.includes(a?.split("/")[1]);
  });
  const secondBps = useBusinessProcessesQuery({
    // @ts-ignore
    skip: !firstBpIds.length,
    variables: {
      filter: {
        ancestry_in: filteredGetFirstBpsChild.length
          ? filteredGetFirstBpsChild
          : [0],
      },
    },
  });

  const getSecondBps =
    secondBps.data?.navigatorBusinessProcesses?.collection || [];
  const handleGetSecondBps = getSecondBps.map(toLabelValue);

  // @ts-ignore
  const getBpsValues = [...firstBpIds, ...secondBpIds];
  console.log("getBpsValues:", getBpsValues);
  const hasChild = filteredGetFirstBpsChild
    .map((a) => a?.split("/")[1])
    .flat(2);
  console.log("hasChild:", hasChild);
  console.log(
    "getBpsValues:",
    getBpsValues.filter((a) => !hasChild.includes(a))
  );
  return (
    <div>
      <Form onSubmit={handleSubmit(submit)}>
        <Input
          name="name"
          label="Name*"
          placeholder="Name"
          innerRef={register({ required: true })}
          error={errors.name && capitalize(errors.name.message)}
        />
        <FormSelect
          isMulti
          isLoading={mainBps.loading}
          name="businessProcessMain"
          register={register}
          setValue={setValue}
          label="Main Business Process"
          placeholder="Main Business Process"
          options={handleGetMainBps}
          // defaultValue={businessProcesses}
        />
        {mainBpIds && (
          <FormSelect
            isMulti
            isLoading={firstBps.loading}
            name="businessProcessFirst"
            register={register}
            setValue={setValue}
            label="First Business Process"
            placeholder="First Business Process"
            options={handleGetFirstBps}
            // defaultValue={businessProcesses}
          />
        )}

        {firstBpIdsWatch && (
          <FormSelect
            isMulti
            isLoading={secondBps.loading}
            name="businessProcessSecond"
            register={register}
            setValue={setValue}
            label="Second Business Process"
            placeholder="Second Business Process"
            options={handleGetSecondBps}
            // defaultValue={businessProcesses}
          />
        )}
        {firstBpIdsWatch && (
          <FormSelect
            isMulti
            isLoading={mainBps.loading}
            name="businessProcessIds"
            register={register}
            isDisabled={true}
            setValue={setValue}
            label="Selected Business Process"
            placeholder="Selected Business Process"
            options={handleGetMainBps}
            defaultValue={businessProcesses}
          />
        )}
        <Select
          name="levelOfRisk"
          placeholder="Level of risk"
          label="Level of risk*"
          options={levelOfRisks}
          onChange={handleChange("levelOfRisk")}
          error={errors.levelOfRisk && errors.levelOfRisk.message}
          defaultValue={levelOfRisks.find(
            (option) => option.value === levelOfRisk
          )}
        />
        <Select
          name="typeOfRisk"
          placeholder="Type of risk"
          label={"Type of risk*"}
          options={typeOfRisks}
          onChange={handleChange("typeOfRisk")}
          error={errors?.typeOfRisk?.message || ""}
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
          {isCreate ? (
            <StyledDialogButton
              className="black px-5 ml-2"
              onConfirm={
                setModal
                  ? () => setModal(false)
                  : () => history.replace(`/risk`)
              }
              isCreate
            >
              Cancel
            </StyledDialogButton>
          ) : (
            <StyledDialogButton
              className="black px-5 ml-2"
              onConfirm={setModal ? () => setModal(false) : toggleEditMode}
              isEdit
            >
              Cancel
            </StyledDialogButton>
          )}
        </div>
      </Form>
    </div>
  );
};

export default RiskForm;
const StyledDialogButton = styled(DialogButton)`
  background: var(--soft-grey);
`;
// -------------------------------------------------------------------------
// Construct Options
// -------------------------------------------------------------------------

const levelOfRisks = Object.entries(LevelOfRisk).map(([label, value]) => ({
  label,
  value,
}));

const typeOfRisks = Object.entries(TypeOfRisk).map(([label, value]) => ({
  label: capitalCase(value),
  value,
}));

// -------------------------------------------------------------------------
// Validation Schema
// -------------------------------------------------------------------------

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  // businessProcessIds: yup.array().of(
  //   yup.object().shape({
  //     label: yup.string(),
  //     value: yup.string(),
  //   })
  // ),
  levelOfRisk: yup.string().required("Level of risk is a required field"),
  typeOfRisk: yup.string().required("Type of risk is a required field"),
});

// -------------------------------------------------------------------------
// Type Definitions
// -------------------------------------------------------------------------

export interface RiskFormValues {
  name?: string;
  businessProcessIds?: any;
  levelOfRisk?: LevelOfRisk;
  typeOfRisk?: TypeOfRisk;
}

// export interface RiskFormDefaultValues {
//   name?: string;
//   businessProcesses?: Suggestions;
//   levelOfRisk?: LevelOfRisk;
//   typeOfRisk?: TypeOfRisk;
// }

export interface RiskFormProps {
  onCancel?: () => void;
  setModal?: any;
  onSubmit?: (data: RiskFormValues) => void;
  submitting?: boolean;
  defaultValues?: RiskFormValues;
  isCreate?: boolean;
  history?: any;
  toggleEditMode?: any;
}
