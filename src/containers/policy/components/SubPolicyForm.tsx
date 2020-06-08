import React, { useEffect, useState, Fragment } from "react";
import { useForm } from "react-hook-form";
import { Form } from "reactstrap";
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
import TextEditorField from "../../../shared/components/forms/TextEditorTinyMce";

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

  function onChangeEditor(data: any) {
    setValue("description", data?.level?.content);
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
        ? submitFirst && submitFirst({ ...values, ...attr })
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
    statusWhenUpdate === "release" || parentStatus === "release" || !draft
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
  return (
    <div>
      <Form>
        <Input
          name="title"
          label="Sub-Policy Title*"
          placeholder="Sub-Policy Title"
          innerRef={register({ required: true })}
          error={errors.title && "title is a required field"}
        />
        <div className="mb-3">
          <label>Policy Description*</label>
          <TextEditorField
            name="description"
            register={register}
            onChange={onChangeEditor}
            defaultValue={defaultValues?.description || ""}
            invalid={!!errors.description}
            error={errors.description && "Description field is too short"}
          />
          {/* <TextEditor
            data={watch("description")}
            onChange={handleEditorChange}
            invalid={errors.description ? true : false}
            error={errors.description && "Description field is too short"}
          /> */}
        </div>
        <Select
          name="referenceIds"
          label="Sub-Policy Reference*"
          placeholder="Sub-Policy Reference"
          loading={referenceData.loading}
          onChange={handleReferenceChange}
          options={references}
          isMulti
          defaultValue={defaultReference}
          error={errors.referenceIds && "referenceIds is a required field"}
        />

        <div className="d-flex justify-content-end mt-3">
          <Button
            type="button"
            onClick={() => setShowAttrs(true)}
            className="pwc mr-2"
          >
            Insert Attributes
          </Button>
          {premise ? (
            //ini yang kedua
            <Fragment>
              <DialogButton
                color="primary"
                loading={submittingDraft}
                className="pwc mr-2 px-5"
                onConfirm={handleSubmit(saveAsDraftSecondPhase)}
                message={
                  defaultValues.title
                    ? `Save your change on "${defaultValues.title}"?`
                    : "Create Sub-Policy?"
                }
              >
                Save As Draft
              </DialogButton>
              <DialogButton
                color="primary"
                loading={secondDraftLoading}
                className="pwc px-5"
                onConfirm={handleSubmit(submitSecondPhase)}
                message={
                  defaultValues.title
                    ? `Save your change on "${defaultValues.title}"?`
                    : "Create Sub-Policy?"
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
                className="pwc mr-2 px-5"
                onConfirm={handleSubmit(saveAsDraftFirstPhase)}
                message={
                  defaultValues.title
                    ? `Save your change on "${defaultValues.title}"?`
                    : "Create Sub-Policy?"
                }
              >
                Save As Draft
              </DialogButton>
              <DialogButton
                color="primary"
                loading={submitting}
                className="pwc px-5"
                onConfirm={handleSubmit(submitFirstPhase)}
                message={
                  defaultValues.title
                    ? `Save your change on "${defaultValues.title}"?`
                    : "Create Sub-Policy?"
                }
              >
                Submit
              </DialogButton>
            </Fragment>
          )}{" "}
          {isCreate ? (
            <DialogButton
              className="black px-5 ml-2"
              style={{ backgroundColor: "rgba(233, 236, 239, 0.8)" }}
              onConfirm={() => history.replace(`/policy`)}
              isCreate
            >
              Cancel
            </DialogButton>
          ) : (
            <DialogButton
              className="black px-5 ml-2"
              style={{ backgroundColor: "rgba(233, 236, 239, 0.8)" }}
              onConfirm={toggleEditMode}
              isEdit
            >
              Cancel
            </DialogButton>
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
          onSubmit={onSubmitModal}
          onCancel={() => setShowAttrs(false)}
        />
      </Modal>
    </div>
  );
};

export default SubPolicyForm;

// -------------------------------------------------------------------------
// Construct Modal Form Component
// -------------------------------------------------------------------------

const SubPolicyAttributeForm = ({
  defaultValues,
  onSubmit,
  onCancel,
}: {
  defaultValues: SubPolicyModalFormValues;
  onCancel: () => void;
  onSubmit: (v: SubPolicyModalFormValues) => void;
}) => {
  const formModal = useForm<SubPolicyModalFormValues>({
    defaultValues,
    validationSchema: validationSchemaAttributes,
  });

  const resourceQ = useResourcesQuery();
  const resourceOptions = oc(resourceQ.data)
    .navigatorResources.collection([])
    .map(toLabelValue);

  const businessProcessesQ = useBusinessProcessesQuery();
  const businessProcessesOptions = oc(businessProcessesQ.data)
    .navigatorBusinessProcesses.collection([])
    .map(toLabelValue);
  const checkBp = formModal.watch("businessProcessIds");

  const [filter, setFilter] = useState({});

  useEffect(() => {
    setFilter({ business_processes_id_in: checkBp });
  }, [checkBp]);

  const controlsQ = useControlsQuery({
    variables: {
      filter,
    },
    fetchPolicy: "network-only",
  });
  const controlsOptions = oc(controlsQ.data)
    .navigatorControls.collection([])
    .map(({ id, description }) => ({ label: description || "", value: id }));
  const risksQ = useRisksQuery({
    variables: {
      filter,
    },
    fetchPolicy: "network-only",
  });
  const risksOptions = oc(risksQ.data)
    .navigatorRisks.collection([])
    .map(toLabelValue);

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
        defaultValue={resourceOptions.filter((res) =>
          oc(defaultValues)
            .resourceIds([])
            .includes(res.value)
        )}
        error={formModal.errors.resourceIds && "Resources is a required field"}
      />
      <FormSelect
        isMulti
        isLoading={businessProcessesQ.loading}
        name="businessProcessIds"
        register={formModal.register}
        setValue={formModal.setValue}
        label="Business Processes*"
        placeholder="Business Processes"
        options={businessProcessesOptions}
        defaultValue={businessProcessesOptions.filter((res) =>
          oc(defaultValues)
            .businessProcessIds([])
            .includes(res.value)
        )}
        error={
          formModal.errors.businessProcessIds &&
          "Business processes is a required field"
        }
      />
      <FormSelect
        isMulti
        loading={risksQ.loading}
        name="riskIds"
        register={formModal.register}
        setValue={formModal.setValue}
        placeholder="Risk"
        label="Risk"
        isDisabled={checkBp?.length ? false : true}
        options={risksOptions}
        defaultValue={risksOptions.filter((res) =>
          oc(defaultValues)
            .riskIds([])
            .includes(res.value)
        )}
        error={formModal.errors.riskIds && "Risk is a required field"}
      />{" "}
      <FormSelect
        isMulti
        loading={controlsQ.loading}
        name="controlIds"
        register={formModal.register}
        setValue={formModal.setValue}
        placeholder="Control"
        label="Control"
        isDisabled={checkBp?.length ? false : true}
        options={controlsOptions}
        defaultValue={controlsOptions.filter((res) =>
          oc(defaultValues)
            .controlIds([])
            .includes(res.value)
        )}
        error={formModal.errors.controlIds && "Control is a required field"}
      />
      <div className=" d-flex justify-content-end">
        <Button
          type="button"
          className="mr-2 cancel"
          onClick={() => onCancel()}
        >
          Cancel
        </Button>

        <Button
          type="button"
          className="pwc px-4"
          onClick={formModal.handleSubmit(onSubmit)}
        >
          Save Attribute
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
const validationSchemaAttributes = yup.object().shape({
  businessProcessIds: yup.array().required(),
  // controlIds: yup.array().required(),
  // resourceIds: yup.array().required(),
  // riskIds: yup.array().required(),
});
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
}

type SubPolicyModalFormValues = Pick<
  SubPolicyFormValues,
  "resourceIds" | "businessProcessIds" | "controlIds" | "riskIds"
>;
