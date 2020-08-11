import { capitalCase } from "capital-case";
import { capitalize } from "lodash";
import React, { useEffect, useState } from "react";
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
  console.log("defaultValues:", defaultValues);
  useEffect(() => {
    register({ name: "levelOfRisk", required: true });
    register({ name: "typeOfRisk" });
  }, [register]);

  const handleChange = (name: keyof RiskFormValues) => ({ value }: any) => {
    setValue(name, value);
  };

  const submit = (values: RiskFormValues) => {
    onSubmit &&
      onSubmit({
        ...values,
        businessProcessIds: handleGetDefaultValueBps.length
          ? handleGetDefaultValueBps.map((a) => a.value).flat(5)
          : undefined,
      });
  };

  const name = defaultValues?.name;
  const levelOfRisk = defaultValues?.levelOfRisk;
  const businessProcesses = defaultValues?.businessProcessIds || [];
  const typeOfRisk = defaultValues?.typeOfRisk;

  // Business Process Bar

  const mainBpIds = watch("businessProcessMain") || [];
  const firstBpIds = watch("businessProcessFirst") || [];
  const secondBpIds = watch("businessProcessSecond") || [];
  // @ts-ignore
  const checkMainBpIds = mainBpIds.length;
  // @ts-ignore
  const checkFirstBpIds = firstBpIds.length;
  const dataModifier = (a: any) => {
    for (let i = 0; i < a.length; ++i) {
      for (let j = i + 1; j < a.length; ++j) {
        if (a[i] === a[j]) a.splice(j--, 1);
      }
    }

    return a;
  };
  const GlobalBps = useBusinessProcessesQuery({
    variables: { filter: { ancestry_null: false } },
  });
  const mainBps = useBusinessProcessesQuery({
    variables: { filter: { ancestry_null: true } },
  });
  const getBps = mainBps.data?.navigatorBusinessProcesses?.collection || [];
  const handleGetMainBps = getBps.map(toLabelValue);

  const firstBps = useBusinessProcessesQuery({
    skip: !checkMainBpIds,
    variables: { filter: { ancestry_in: mainBpIds } },
  });

  const getFirstBps =
    firstBps.data?.navigatorBusinessProcesses?.collection || [];

  const getFirstBpsParent = getFirstBps.map((a) => a.parent?.name);
  const handleGetFirstBps = dataModifier(getFirstBpsParent).map((a: any) => {
    return {
      label: a,
      options: getFirstBps
        .filter((b) => a.includes(b.parent?.name))
        .map(toLabelValue),
    };
  });

  const getFirstBpsChild = getFirstBps
    .map((a) => a.children)
    .flat(2)
    .map((b) => b?.ancestry);

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
  const getSecondBpsParent = getSecondBps.map((a) => a.parent?.name);

  const handleGetSecondBps = dataModifier(getSecondBpsParent).map((a: any) => {
    return {
      label: a,
      options: getSecondBps
        .filter((b) => a.includes(b.parent?.name))
        .map(toLabelValue),
    };
  });
  // bps values

  const suspectedParentChildId = getFirstBps
    .map((a) =>
      a.children?.map((b) => {
        return { childrenId: b.id, parentId: a.id };
      })
    )
    .flat(2);

  // @ts-ignore
  const bpsValues = [...firstBpIds, ...secondBpIds];

  const problematicChild = bpsValues
    .map((a) => {
      if (suspectedParentChildId.map((b) => b?.childrenId).includes(a)) {
        return a;
      } else {
        return;
      }
    })
    .filter((a) => a !== undefined);

  const getBannedFirstBpsParents = useBusinessProcessesQuery({
    skip: !problematicChild.length,
    variables: { filter: { id_matches_any: problematicChild } },
  });

  const getBannedFirstBps =
    getBannedFirstBpsParents.data?.navigatorBusinessProcesses?.collection || [];

  const getBannedFirstBpsIds = getBannedFirstBps.map((a) => a.parent?.id);

  const bpsFinalValues =
    //@ts-ignore
    firstBpIds.length
      ? bpsValues.filter((a) => !getBannedFirstBpsIds.includes(a))
      : [];
  const getValueFormBpsData =
    GlobalBps.data?.navigatorBusinessProcesses?.collection || [];
  const handleGetDefaultValueBps = getValueFormBpsData
    .filter((a) => bpsFinalValues.includes(a.id))
    .map((b) => {
      return { value: b.id, label: b.name || "" };
    });
  console.log("handleGetDefaultValueBps:", handleGetDefaultValueBps);
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
        />
        {checkMainBpIds ? (
          <FormSelect
            isMulti
            isLoading={firstBps.loading}
            name="businessProcessFirst"
            register={register}
            setValue={setValue}
            label="First Business Process"
            placeholder="First Business Process"
            options={handleGetFirstBps}
          />
        ) : null}

        {checkFirstBpIds && checkMainBpIds ? (
          <FormSelect
            isMulti
            isLoading={secondBps.loading}
            name="businessProcessSecond"
            register={register}
            setValue={setValue}
            label="Second Business Process"
            placeholder="Second Business Process"
            options={handleGetSecondBps}
            // value={}
          />
        ) : null}
        <FormSelect
          isMulti
          isLoading={GlobalBps.loading}
          name="businessProcessIds"
          register={register}
          isDisabled={true}
          value={
            businessProcesses.length && !checkMainBpIds
              ? businessProcesses
              : handleGetDefaultValueBps
          }
          setValue={setValue}
          label="Selected Business Process"
          placeholder="Selected Business Process"
          options={handleGetMainBps}
        />
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
