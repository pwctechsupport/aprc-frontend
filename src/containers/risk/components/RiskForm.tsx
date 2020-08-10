import { capitalCase } from "capital-case";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form } from "reactstrap";
import * as yup from "yup";
import {
  BusinessProcessesDocument,
  LevelOfRisk,
  TypeOfRisk,
  BusinessProcessesQuery,
  useBusinessProcessesQuery,
} from "../../../generated/graphql";
import DialogButton from "../../../shared/components/DialogButton";
import AsyncSelect from "../../../shared/components/forms/AsyncSelect";
import Input from "../../../shared/components/forms/Input";
import Select, { FormSelect } from "../../../shared/components/forms/Select";
import {
  prepDefaultValue,
  Suggestions,
  toLabelValue,
} from "../../../shared/formatter";
import useLazyQueryReturnPromise from "../../../shared/hooks/useLazyQueryReturnPromise";
import styled from "styled-components";
import { capitalize } from "lodash";

const RiskForm = ({
  setModal,
  onSubmit,
  defaultValues,
  submitting,
  toggleEditMode,
  history,
  isCreate,
}: RiskFormProps) => {
  const { register, setValue, errors, handleSubmit } = useForm<RiskFormValues>({
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
    console.log("values:", values);
    onSubmit && onSubmit(values);
  };

  const name = defaultValues?.name;
  const levelOfRisk = defaultValues?.levelOfRisk;
  const businessProcesses = defaultValues?.businessProcessIds || [];
  const typeOfRisk = defaultValues?.typeOfRisk;

  // const getBusinessProcesses = useLazyQueryReturnPromise<
  //   BusinessProcessesQuery
  // >(BusinessProcessesDocument);
  // const groupedRiskOptions = riskOption.map((a) => {
  //   return {
  //     label: a.label,
  //     options: oc(risksQ.data)
  //       .navigatorRisks.collection([])
  //       .filter((b) => b.businessProcess?.includes(a.label))
  //       .map(toLabelValue),
  //   };
  // });
  // async function handleGetBps(name_cont: string = ""): Promise<Suggestions> {
  //   try {
  //     const { data } = await getBusinessProcesses({
  //       filter: { name_cont, ancestry_null: false },
  //     });
  //     const newData = data.navigatorBusinessProcesses?.collection || [];
  //     console.log("newData:", newData);
  //     const coolOptions = newData.map((a) => {
  //       return {
  //         label: `${
  //           a.parent?.parent?.name ? `(${a.parent?.parent.name})` : ""
  //         } (${a.parent?.name || ""}) `,
  //         options: newData.map(toLabelValue),
  //       };
  //     });
  //     return coolOptions;
  //   } catch (error) {
  //     return [];
  //   }
  // }
  const bps = useBusinessProcessesQuery({
    variables: { filter: { ancestry_null: false } },
  });
  const getBps = bps.data?.navigatorBusinessProcesses?.collection || [];
  const getBpsParent = getBps.map((a) => {
    return {
      id: a.id,
      parent: a.parent?.parent?.name,
      name: a.parent?.name,
    };
  });

  const dataModifier = (a: any) => {
    for (let i = 0; i < a.length; ++i) {
      for (let j = i + 1; j < a.length; ++j) {
        if (a[i].name === a[j].name) a.splice(j--, 1);
      }
    }

    return a;
  };
  const handleGetBps = dataModifier(
    getBpsParent.sort((a, b) =>
      b.id && a.id ? (a.id > b.id ? 1 : b.id > a.id ? -1 : 0) : 0
    )
  ).map((a: any) => {
    return {
      label: a.parent ? `${a.parent} > ${a.name}` : a.name,
      options: getBps
        .filter((b) => b.parent?.name?.includes(a.name))
        .map(toLabelValue),
    };
  });
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
          isLoading={bps.loading}
          name="businessProcessIds"
          register={register}
          setValue={setValue}
          label="Business Process"
          placeholder="Business Process"
          options={handleGetBps}
          defaultValue={businessProcesses}
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
