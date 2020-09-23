import React, { useEffect, useState, Fragment } from "react";
import { useForm } from "react-hook-form";
import { Form, FormText } from "reactstrap";
import { oc } from "ts-optchain";
import {
  useBusinessProcessesQuery,
  useControlsQuery,
  useReferencesQuery,
  useResourcesQuery,
  useRisksQuery,
  usePolicyQuery,
} from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import DialogButton from "../../../shared/components/DialogButton";
import Input from "../../../shared/components/forms/Input";
import Select, { FormSelect } from "../../../shared/components/forms/Select";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";
import Modal from "../../../shared/components/Modal";
import { toLabelValue } from "../../../shared/formatter";
import * as yup from "yup";
import { toast } from "react-toastify";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css"; // Import Sun Editor's CSS File
import styled from "styled-components";

const SubPolicyForm = ({
  saveAsDraftFirst,
  submitSecond,
  secondDraftLoading,
  submitFirst,
  defaultValues,
  submitting,
  saveAsDraftSecond,
  parentStatus,
  premise,
  submittingDraft,
  isCreate,
  history,
  toggleEditMode,
  isAdmin = true,
}: SubPolicyFormProps) => {
  const resourceQ = useResourcesQuery();

  const {
    resourceIds,
    businessProcessIds,
    controlIds,
    riskIds,
  } = defaultValues;
  const [showAttrs, setShowAttrs] = useState(false);
  const [attr, setAttr] = useState<SubPolicyModalFormValues>({
    resourceIds,
    businessProcessIds,
    controlIds,
    riskIds,
  });
  console.log("attr:", attr);
  const skipBispro = attr.businessProcessIds || [];
  const getBisproDefValQ = useBusinessProcessesQuery({
    skip: !skipBispro.length,
    variables: { filter: { id_matches_any: attr.businessProcessIds } },
  });
  const getValueFormBpsData =
    getBisproDefValQ.data?.navigatorBusinessProcesses?.collection || [];

  const getParentOrGrandParentBps = getValueFormBpsData.map((a) => {
    if (a.parent?.parent?.id) {
      return {
        value: a.id || "",
        label: a.name || "",
        grandParentLabel: a.parent.parent.name || "",
        grandParentValue: a.parent.parent.id || "",
        parentLabel: a.parent.name || "",
        parentValue: a.parent.id || "",
      };
    } else {
      return {
        parentValue: a.id || "",
        parentLabel: a.name || "",
        grandParentLabel: a.parent?.name || "",
        grandParentValue: a.parent?.id || "",
      };
    }
  });
  const { data } = usePolicyQuery({
    variables: { id: defaultValues.parentId },
    fetchPolicy: "network-only",
  });
  const statusWhenUpdate = data?.policy?.status || "";
  const draft = data?.policy?.draft;
  const { register, handleSubmit, setValue, errors } = useForm<
    SubPolicyFormValues
  >({ validationSchema, defaultValues });
  const referenceData = useReferencesQuery({ variables: { filter: {} } });
  const references = oc(referenceData)
    .data.navigatorReferences.collection([])
    .map(toLabelValue);
  const requestStatus = oc(data).policy.requestStatus();
  const notRequested = !requestStatus;
  const rejected = requestStatus === "rejected";
  useEffect(() => {
    register({ name: "parentId" });
    register({ name: "referenceIds" });
    register({ name: "description", required: true });
  }, [register]);

  function handleReferenceChange(multiSelect: any) {
    if (multiSelect) {
      setValue(
        "referenceIds",
        multiSelect.map((a: any) => a.value)
      );
    }
  }

  // Functions for changing buttons
  // Functions when create
  function saveAsDraftFirstPhase(values: SubPolicyFormValues) {
    attr.businessProcessIds?.length
      ? saveAsDraftFirst && saveAsDraftFirst({ ...values, ...attr })
      : toast.error("Insert attributes is a required field");
  }
  function submitFirstPhase(values: SubPolicyFormValues) {
    statusWhenUpdate === "release" || parentStatus === "release" || !draft
      ? attr.businessProcessIds?.length
        ? data
          ? submitFirst && submitFirst({ ...values, ...attr })
          : toast.error("Network Error")
        : toast.error("Insert attributes is a required field")
      : toast.error(
          "Parent policy status must be 'release' before user can submit Sub Policy"
        );
  }

  // Functions when update
  function saveAsDraftSecondPhase(values: SubPolicyFormValues) {
    attr.businessProcessIds?.length
      ? saveAsDraftSecond && saveAsDraftSecond({ ...values, ...attr })
      : toast.error("Insert attributes is a required field");
  }

  function submitSecondPhase(values: SubPolicyFormValues) {
    statusWhenUpdate === "release" ||
    parentStatus === "release" ||
    (!draft && (notRequested || rejected))
      ? attr.businessProcessIds?.length
        ? submitSecond && submitSecond({ ...values, ...attr })
        : toast.error("Insert attributes is a required field")
      : toast.error(
          "Parent policy status must be 'release' before user can submit Sub Policy"
        );
  }

  function onSubmitModal(values: SubPolicyModalFormValues) {
    setAttr(values);
    setShowAttrs(false);
  }
  if (referenceData.loading) {
    return <LoadingSpinner centered size={30} />;
  }

  const defaultReference = references.filter((reference) => {
    return oc(defaultValues)
      .referenceIds([])
      .includes(reference.value);
  });

  function onChangeEditor(data: any) {
    setValue("description", data);
  }

  return (
    <div>
      <Form>
        <Input
          name="title"
          label="Sub-policy title*"
          placeholder="Sub-policy title"
          innerRef={register({ required: true })}
          error={errors.title && "Sub policy title is a required field"}
        />
        <div className="mb-3">
          <label>Policy description*</label>

          <div
            style={{
              padding: errors.description ? 1 : 0,
              backgroundColor: "red",
            }}
          >
            <SunEditor
              showToolbar={true}
              enable={true}
              show={true}
              name="description"
              setContents={defaultValues?.description || ""}
              onChange={onChangeEditor}
              enableToolbar={true}
              setOptions={{
                showPathLabel: false,
                imageUploadSizeLimit: 10485760,
                linkProtocol: "http://",
                minHeight: "30vh",
                height: "auto",
                font: [
                  "Serif",
                  "Sans Serif",
                  "Monospace",
                  "Candara",
                  "Verdana",
                  "Arial",
                  "Twentieth Century",
                  "Calibri",
                  "Georgia",
                  "Abadi",
                  "Helvetica",
                  "Garamond",
                  "Bookman",
                  "Arial Nova Cond",
                  "Bahnschrift",
                  "Selawik",
                  "Perpetua",
                ],
                buttonList: [
                  ["font", "fontSize", "align"],
                  ["fontColor", "hiliteColor", "bold", "underline", "italic"],
                  ["image", "table", "link"],
                ],
              }}
            />
          </div>
          {errors.description && (
            <FormText className="text-danger " color="red">
              Policy description is a required field
            </FormText>
          )}
          {/* <TextEditorField
            name="description"
            register={register}
            onChange={onChangeEditor}
            defaultValue={defaultValues?.description || ""}
            invalid={!!errors.description}
            error={
              errors.description &&
              "Description field is too short and the field is required"
            }
          /> */}
          {/* <TextEditor
            data={watch("description")}
            onChange={handleEditorChange}
            invalid={errors.description ? true : false}
            error={errors.description && "Description field is too short"}
          /> */}
        </div>
        <Select
          name="referenceIds"
          label="Sub-policy reference*"
          placeholder="Sub-policy reference"
          loading={referenceData.loading}
          onChange={handleReferenceChange}
          options={references}
          isMulti
          defaultValue={defaultReference}
          error={
            errors.referenceIds && "Sub-policy reference is a required field"
          }
        />

        <div className="text-right mt-3">
          <Button
            type="button"
            onClick={() => setShowAttrs(true)}
            className="pwc btn-sm-block mb-1 mb-sm-0 mr-2"
            loading={getBisproDefValQ.loading || resourceQ.loading}
          >
            Insert attributes
          </Button>
          {premise ? (
            //ini yang kedua
            <Fragment>
              <DialogButton
                color="primary"
                loading={submittingDraft}
                className="pwc btn-sm-block mb-1 mb-sm-0 mr-2 px-5"
                onConfirm={handleSubmit(saveAsDraftSecondPhase)}
                message={
                  defaultValues.title
                    ? `Save your change on "${defaultValues.title}"?`
                    : "Create sub-policy?"
                }
              >
                Save As draft
              </DialogButton>
              <DialogButton
                color="primary"
                loading={secondDraftLoading}
                className="pwc btn-sm-block mb-1 mb-sm-0 px-5"
                onConfirm={handleSubmit(submitSecondPhase)}
                message={
                  defaultValues.title
                    ? `Save your change on "${defaultValues.title}"?`
                    : "Create sub-policy?"
                }
              >
                Submit
              </DialogButton>
            </Fragment>
          ) : (
            // ini pertama
            <Fragment>
              <DialogButton
                color="primary"
                loading={submitting}
                className="pwc btn-sm-block mb-1 mb-sm-0 mr-2 px-5"
                onConfirm={handleSubmit(saveAsDraftFirstPhase)}
                message={
                  defaultValues.title
                    ? `Save your change on "${defaultValues.title}"?`
                    : "Create sub-policy?"
                }
              >
                Save as draft
              </DialogButton>
              <DialogButton
                color="primary"
                loading={submitting}
                className="pwc btn-sm-block mb-1 mb-sm-0 px-5"
                onConfirm={handleSubmit(submitFirstPhase)}
                message={
                  defaultValues.title
                    ? `Save your change on "${defaultValues.title}"?`
                    : "Create sub-policy?"
                }
              >
                Submit
              </DialogButton>
            </Fragment>
          )}{" "}
          {isCreate ? (
            <StyledDialogButton
              className="cancel btn-sm-block px-5 ml-sm-2"
              style={{ backgroundColor: "rgba(233, 236, 239, 0.8)" }}
              onConfirm={() => history.replace(`/policy`)}
              isCreate
            >
              Cancel
            </StyledDialogButton>
          ) : (
            <StyledDialogButton
              className="cancel btn-sm-block px-5 ml-sm-2"
              style={{ backgroundColor: "rgba(233, 236, 239, 0.8)" }}
              onConfirm={toggleEditMode}
              isEdit
            >
              Cancel
            </StyledDialogButton>
          )}
        </div>
      </Form>

      {/* MODAL */}
      <Modal
        isOpen={showAttrs}
        size="xl"
        toggle={() => setShowAttrs(!showAttrs)}
        title="Insert Attributes"
      >
        <SubPolicyAttributeForm
          defaultValues={attr}
          bpsDefaultValue={getParentOrGrandParentBps}
          onSubmit={onSubmitModal}
          onCancel={() => setShowAttrs(false)}
          resourceQ={resourceQ}
        />
      </Modal>
    </div>
  );
};

export default SubPolicyForm;

const StyledDialogButton = styled(DialogButton)`
  background: var(--soft-grey);
`;
// -------------------------------------------------------------------------
// Construct Modal Form Component
// -------------------------------------------------------------------------

const SubPolicyAttributeForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  bpsDefaultValue,
  resourceQ,
}: {
  bpsDefaultValue: any;
  defaultValues: SubPolicyModalFormValues;
  onCancel: () => void;
  onSubmit: (v: SubPolicyModalFormValues) => void;
  resourceQ: any;
}) => {
  const formModal = useForm<SubPolicyModalFormValues>({
    defaultValues,
    // validationSchema: validationSchemaAttributes,
  });
  const resourceOptions = oc(resourceQ.data)
    .navigatorResources.collection([])
    .map(toLabelValue);

  const checkRisk = formModal.watch("riskIds") || [];
  const checkControl = formModal.watch("controlIds") || [];
  // Business Process Bar

  const globalBps = useBusinessProcessesQuery({
    variables: { filter: { ancestry_null: false } },
  });
  const businessProcessesOptions = oc(globalBps.data)
    .navigatorBusinessProcesses.collection([])
    .map(toLabelValue);

  // defaultValues Bps

  const dataModifier = (a: any) => {
    for (let i = 0; i < a.length; ++i) {
      for (let j = i + 1; j < a.length; ++j) {
        if (a[i] === a[j]) a.splice(j--, 1);
      }
    }

    return a;
  };
  const dataModifierCustom = (a: any) => {
    for (let i = 0; i < a.length; ++i) {
      for (let j = i + 1; j < a.length; ++j) {
        if (a[i].value === a[j].value) a.splice(j--, 1);
      }
    }

    return a;
  };

  const mainBpsDefaultValue = dataModifierCustom(
    bpsDefaultValue.map((a: any) => {
      return { label: a.grandParentLabel, value: a.grandParentValue };
    })
  );
  const defValMainBps = dataModifier(
    bpsDefaultValue.map((a: any) => a.grandParentValue).flat(10)
  );
  const defValFirstBps = dataModifier(
    bpsDefaultValue.map((a: any) => a.parentValue).flat(10)
  );
  const defValSecondBps = dataModifier(
    bpsDefaultValue.map((a: any) => a.value).flat(10)
  );

  const mainBpIdsWatch = formModal.watch("businessProcessMain") || [];
  const firstBpIdsWatch = formModal.watch("businessProcessFirst") || [];
  const secondBpIdsWatch = formModal.watch("businessProcessSecond") || [];

  const checkMainBp = formModal.watch("businessProcessMain");
  const checkFirstBp = formModal.watch("businessProcessFirst");
  const checkSecondBp = formModal.watch("businessProcessSecond");

  const [mainBpIds, setMainBpIds] = useState([...defValMainBps]);
  const [firstBpIds, setFirstBpIds] = useState([...defValFirstBps]);
  const [secondBpIds, setSecondBpIds] = useState([...defValSecondBps]);

  const [stopMain, setStopMain] = useState(false);
  const [stopFirst, setStopFirst] = useState(false);
  const [stopSecond, setStopSecond] = useState(false);

  useEffect(() => {
    if (checkMainBp !== undefined && checkMainBp !== null) {
      setMainBpIds(mainBpIdsWatch);
      setStopMain(false);
    } else if (checkMainBp === null && !stopMain) {
      setMainBpIds(mainBpIdsWatch);
      setStopMain(true);
    }
  }, [checkMainBp, mainBpIdsWatch, stopMain]);
  useEffect(() => {
    if (checkFirstBp !== undefined && checkFirstBp !== null) {
      setFirstBpIds(firstBpIdsWatch);
      setStopFirst(false);
    } else if (checkFirstBp === null && !stopFirst) {
      setFirstBpIds(firstBpIdsWatch);
      setStopFirst(true);
    }
  }, [checkFirstBp, firstBpIdsWatch, stopFirst]);
  useEffect(() => {
    if (checkSecondBp !== undefined && checkSecondBp !== null) {
      setSecondBpIds(secondBpIdsWatch);
      setStopSecond(false);
    } else if (checkSecondBp === null && !stopSecond) {
      setSecondBpIds(secondBpIdsWatch);
      setStopSecond(true);
    }
  }, [checkSecondBp, secondBpIdsWatch, stopSecond]);

  const mainBps = useBusinessProcessesQuery({
    variables: { filter: { ancestry_null: true } },
  });
  const getBps = mainBps.data?.navigatorBusinessProcesses?.collection || [];

  const handleGetMainBps = getBps.map(toLabelValue);

  const firstBps = useBusinessProcessesQuery({
    skip: !mainBpIds.length,
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
    return firstBpIds.includes(a ? a.split("/")[1] : "");
  });
  const secondBps = useBusinessProcessesQuery({
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
  const bpsValues = [...firstBpIds, ...secondBpIds];

  const bpsValuesParent = [...mainBpIds, ...firstBpIds];
  const mainBpsParentChild = getBps
    .map((a) =>
      a.children?.map((b) => {
        return { parentId: a.id, childId: b.id };
      })
    )
    .flat(1)
    .filter((c) => firstBpIds.includes(c?.childId || ""));

  const getRemovedFirstId = mainBpsParentChild
    .map((a) => {
      if (bpsValuesParent.includes(a?.parentId || "")) {
        return undefined;
      } else {
        return a?.childId;
      }
    })
    .filter((a) => a !== undefined);

  const problematicChild = bpsValues
    .map((a) => {
      if (suspectedParentChildId.map((b) => b?.childrenId).includes(a)) {
        return a;
      } else {
        return undefined;
      }
    })
    .filter((a) => a !== undefined);

  const getBannedFirstBpsIds = getBps
    .map((a) =>
      a.children?.map((b) =>
        b.children?.map((c) => {
          return { childId: c.id, parentId: b.id };
        })
      )
    )
    .flat(2)
    .filter((d) => problematicChild.includes(d?.childId))
    .map((a) => a?.parentId);
  const getBannedParentandChildIds = getBps
    .map((a) =>
      a.children?.map((b) =>
        b.children?.map((c) => {
          return { childId: c.id, parentId: b.id };
        })
      )
    )
    .flat(2)
    .filter((d) => secondBpIds.includes(d?.childId || ""));

  const getRemovedId = getBannedParentandChildIds
    .map((a) => {
      if (
        bpsValues
          .filter((b) => !getRemovedFirstId.includes(b))
          .includes(a?.parentId || "")
      ) {
        return undefined;
      } else {
        return a?.childId;
      }
    })
    .filter((a) => a !== undefined);

  const bpsFinalValues = bpsValues
    .filter((a) => !getBannedFirstBpsIds.includes(a))
    .filter((b) => !getRemovedFirstId.includes(b))
    .filter((c) => !getRemovedId.includes(c))
    .filter((d) => d !== undefined);

  const getValueFormBpsData =
    globalBps.data?.navigatorBusinessProcesses?.collection || [];
  const handleGetValueBps = getValueFormBpsData
    .filter((a) => bpsFinalValues.includes(a.id))
    .map((b) => {
      return { value: b.id, label: b.name || "" };
    });
  // bps Values
  const getSecondBpsValues = getSecondBps
    .map(toLabelValue)
    .filter((b) => secondBpIds.includes(b.value));
  const getFirstBpsValues = getFirstBps
    .map(toLabelValue)
    .filter((b) => firstBpIds.includes(b.value));

  const risksQ = useRisksQuery({
    skip: bpsFinalValues.length ? false : true,
    variables: {
      filter: { business_processes_id_in: bpsFinalValues },
    },
    fetchPolicy: "network-only",
  });
  const riskHeader = businessProcessesOptions.filter((a) =>
    bpsFinalValues.includes(a.value)
  );
  const risksOptions = oc(risksQ.data)
    .navigatorRisks.collection([])
    .map(toLabelValue);

  const groupedRiskOptions = riskHeader.map((a) => {
    return {
      label: a.label,
      options: oc(risksQ.data)
        .navigatorRisks.collection([])
        .filter((b) => b.businessProcess?.includes(a.label))
        .map(toLabelValue),
    };
  });

  const controlsQ = useControlsQuery({
    skip: checkRisk.length ? false : true,
    variables: {
      filter: { risks_id_in: checkRisk },
    },
    fetchPolicy: "network-only",
  });
  const controlOption = risksOptions.filter((a) => checkRisk.includes(a.value));

  const controlsOptions = oc(controlsQ.data)
    .navigatorControls.collection([])
    .map(({ id, description }) => ({ label: description || "", value: id }));

  const groupedControlOptions = controlOption.map((a) => {
    return {
      label: a.label,
      options: oc(controlsQ.data)
        .navigatorControls.collection([])
        .map((b) => {
          return {
            risks: b.risks?.map((c) => {
              if (c.id === a.value) {
                return 1;
              } else {
                return 0;
              }
            }),
            label: b.description,
            value: b.id,
          };
        })
        .filter((d) => d.risks?.includes(1))
        .map((z) => {
          return { label: z.label || "", value: z.value };
        }),
    };
  });

  //risk modified default Values

  const riskDefaultValuesOrigin = risksOptions
    .filter((res) =>
      oc(defaultValues)
        .riskIds([])
        .includes(res.value)
    )
    .map((a) => a.value);
  const [riskValue, setRiskValue] = useState(riskDefaultValuesOrigin);
  useEffect(() => {
    if (checkRisk.length) {
      setRiskValue(checkRisk);
    }
  }, [checkRisk]);

  const riskDefaultValues = risksOptions.filter((a) =>
    riskValue.includes(a.value)
  );

  //control modified default Values

  const controlDefaultValuesOrigin = controlsOptions
    .filter((res) =>
      oc(defaultValues)
        .controlIds([])
        .includes(res.value)
    )
    .map((a) => a.value);
  const [controlValue, setControlValue] = useState(controlDefaultValuesOrigin);
  useEffect(() => {
    if (checkControl.length) {
      setControlValue(checkControl);
    }
  }, [checkControl]);
  const controlDefaultValues = controlsOptions.filter((a) =>
    controlValue.includes(a.value)
  );
  const [error, setError] = useState(false);

  const submit = (values: SubPolicyModalFormValues) => {
    if (handleGetValueBps.length) {
      onSubmit &&
        onSubmit({
          controlIds: values.controlIds,
          resourceIds: values.resourceIds,
          riskIds: values.riskIds,
          businessProcessIds: handleGetValueBps.length
            ? handleGetValueBps.map((a) => a.value).flat(5)
            : undefined,
        });
    } else {
      setError(true);
    }
  };

  return (
    <Form>
      <FormSelect
        isMulti
        isLoading={resourceQ.loading}
        name="resourceIds"
        register={formModal.register}
        setValue={formModal.setValue}
        label="Resources"
        options={resourceOptions}
        defaultValue={resourceOptions.filter((res: any) =>
          oc(defaultValues)
            .resourceIds([])
            .includes(res.value)
        )}
        error={formModal.errors.resourceIds && "Resources is a required field"}
      />
      <FormSelect
        isMulti
        isLoading={mainBps.loading}
        name="businessProcessMain"
        register={formModal.register}
        setValue={formModal.setValue}
        label="Main Business Process"
        placeholder="Main Business Process"
        options={handleGetMainBps}
        defaultValue={mainBpsDefaultValue}
      />

      <FormSelect
        isMulti
        isLoading={firstBps.loading}
        name="businessProcessFirst"
        register={formModal.register}
        value={getFirstBpsValues}
        isDisabled={mainBpIds.length ? false : true}
        setValue={formModal.setValue}
        label="Sub Business Process Level 1"
        placeholder="Sub Business Process Level 1"
        options={handleGetFirstBps}
      />

      <FormSelect
        isMulti
        isLoading={secondBps.loading}
        name="businessProcessSecond"
        register={formModal.register}
        setValue={formModal.setValue}
        isDisabled={!firstBpIds.length ? true : mainBpIds.length ? false : true}
        value={getSecondBpsValues}
        label="Sub Business Process Level 2"
        placeholder="Sub Business Process Level 2"
        options={handleGetSecondBps}
      />
      <FormSelect
        isMulti
        isLoading={globalBps.loading}
        name="businessProcessIds"
        register={formModal.register}
        isDisabled={true}
        required
        value={handleGetValueBps}
        setValue={formModal.setValue}
        label="Selected Business Process"
        placeholder="Selected Business Process"
        options={handleGetMainBps}
        error={error ? "Business process is a required field" : undefined}
      />

      <FormSelect
        isMulti
        loading={risksQ.loading}
        name="riskIds"
        register={formModal.register}
        setValue={formModal.setValue}
        placeholder="Risk"
        label="Risk"
        isDisabled={bpsFinalValues?.length ? false : true}
        options={groupedRiskOptions}
        defaultValue={mainBpIds.length ? riskDefaultValues : []}
        error={formModal.errors.riskIds && "Risk is a required field"}
      />
      <FormSelect
        isMulti
        loading={controlsQ.loading}
        name="controlIds"
        register={formModal.register}
        setValue={formModal.setValue}
        placeholder="Control"
        label="Control"
        isDisabled={checkRisk?.length ? false : true}
        options={groupedControlOptions}
        defaultValue={controlDefaultValues}
        error={formModal.errors.controlIds && "Control is a required field"}
      />
      <div className=" d-flex justify-content-end">
        <Button
          type="button"
          className="button cancel mr-2"
          onClick={() => onCancel()}
        >
          Cancel
        </Button>

        <Button
          type="button"
          className="pwc px-4"
          onClick={formModal.handleSubmit(submit)}
        >
          Save attribute
        </Button>
      </div>
    </Form>
  );
};
// ---------------------------------------------------
// Validation
// ---------------------------------------------------

const validationSchema = yup.object().shape({
  title: yup.string().required(),
  description: yup
    .string()
    .min(11)
    .required(),
  referenceIds: yup.array().required(),
});
// const validationSchemaAttributes = yup.object().shape({
//   // businessProcessFirst: yup.array().required(),
//   // controlIds: yup.array().required(),
//   // resourceIds: yup.array().required(),
//   // riskIds: yup.array().required(),
// });
// -------------------------------------------------------------------------
// Type Definitions
// -------------------------------------------------------------------------

export interface SubPolicyFormProps {
  saveAsDraftFirst?: (values: SubPolicyFormValues) => void;
  defaultValues: SubPolicyFormValues;
  submitting?: boolean;
  isAdmin?: boolean;
  saveAsDraftSecond?: any;
  premise?: boolean;
  submittingDraft?: any;
  isCreate?: boolean;
  history?: any;
  toggleEditMode?: any;
  submitFirst?: any;
  submitSecond?: any;
  secondDraftLoading?: any;
  parentStatus?: string;
}

export interface SubPolicyFormValues {
  parentId: string;
  title: string;
  description: string;
  referenceIds?: string[];
  resourceIds?: string[];
  businessProcessIds?: string[];
  controlIds?: string[];
  riskIds?: string[];
  businessProcessMain?: string[];
  businessProcessFirst?: string[];
  businessProcessSecond?: string[];
}

type SubPolicyModalFormValues = Pick<
  SubPolicyFormValues,
  | "resourceIds"
  | "businessProcessIds"
  | "controlIds"
  | "riskIds"
  | "businessProcessMain"
  | "businessProcessFirst"
  | "businessProcessSecond"
>;
