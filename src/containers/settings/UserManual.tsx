import React, { useState, Fragment } from "react";
import Helmet from "react-helmet";
import { useForm } from "react-hook-form";
import { FaDownload, FaPencilAlt } from "react-icons/fa";
import {
  useManualsQuery,
  useUpdateManualMutation,
  useCreateManualMutation,
} from "../../generated/graphql";
import { APP_ROOT_URL } from "../../settings";
import Button from "../../shared/components/Button";
import DateHover from "../../shared/components/DateHover";
import FileInputPdf from "../../shared/components/forms/FileInputPdf";
import Input from "../../shared/components/forms/Input";
import Modal from "../../shared/components/Modal";
import Tooltip from "../../shared/components/Tooltip";
import useAccessRights from "../../shared/hooks/useAccessRights";
import { notifyGraphQLErrors, notifySuccess } from "../../shared/utils/notif";
import EmptyAttribute from "../../shared/components/EmptyAttribute";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import Footer from "../../shared/components/Footer";

export default function UserManual() {
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);
  const isAdminReviewer = useAccessRights(["admin_reviewer"]).every(Boolean);
  const { data, loading } = useManualsQuery({ fetchPolicy: "network-only" });
  const manuals = data?.manuals?.collection || [];
  const [updateManual, updateManualInfo] = useUpdateManualMutation({
    onCompleted: () => {
      notifySuccess("User Manual Updated");
      closeModal();
    },
    onError: notifyGraphQLErrors,
    refetchQueries: ["manuals"],
    awaitRefetchQueries: true,
  });
  const [create, createM] = useCreateManualMutation({
    onCompleted: () => {
      notifySuccess("User Manual Created");
      closeModal();
    },
    onError: notifyGraphQLErrors,
    refetchQueries: ["manuals"],
    awaitRefetchQueries: true,
  });
  function handleDownload(downloadUrl: string, name: string) {
    const link = document.createElement("a");
    link.target = "_blank";
    link.href = downloadUrl;
    link.setAttribute("download", name);
    document.body.appendChild(link);
    link.click();
    link.parentNode && link.parentNode.removeChild(link);
  }
  function closeModal() {
    setCurrentEditId(null);
  }
  function handleSubmitForm(values: UserManualFormValues) {
    updateManual({ variables: { input: { id: currentEditId, ...values } } });
  }
  function handleCreate(values: UserManualFormValues) {
    create({ variables: { input: values } });
  }
  return (
    <div>
      <Helmet>
        <title>User Manual - Settings - PricewaterhouseCoopers</title>
      </Helmet>

      {!loading && manuals.length ? (
        manuals.map((manual) => (
          <Fragment>
            <h4>User Manual</h4>
            <br />
            <div className="d-flex justify-content-between">
              <div>
                <dt>Name</dt>
                <dd>{manual.name}</dd>
                <br />
                <dt>File Size</dt>
                <dd>{manual.fileSize} bytes</dd>
                <br />
                <dt>File Type</dt>
                <dd>{manual.fileType}</dd>
                <br />
                <dt>Last Upadated</dt>
                <DateHover withIcon>{manual.updatedAt}</DateHover>
              </div>
              <div className="d-flex">
                {isAdminReviewer && (
                  <Tooltip description="Edit User Manual">
                    <Button
                      onClick={() => setCurrentEditId(manual.id)}
                      className="soft red mr-2"
                      color=""
                    >
                      <FaPencilAlt />
                    </Button>
                  </Tooltip>
                )}
                <Tooltip description="Download User Manual">
                  <Button
                    className="soft orange"
                    color=""
                    onClick={() =>
                      handleDownload(
                        `${APP_ROOT_URL}${manual.resuploadUrl}`,
                        manual.name || ""
                      )
                    }
                  >
                    <FaDownload />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </Fragment>
        ))
      ) : !loading && isAdminReviewer ? (
        <Fragment>
          <h4>Create User Manual</h4>
          <UserManualForm
            onSubmit={handleCreate}
            onCancel={closeModal}
            create
            defaultValues={manuals.find(
              (manual) => manual.id === currentEditId
            )}
            submitting={createM.loading}
          />
        </Fragment>
      ) : loading ? (
        <LoadingSpinner size={30} centered />
      ) : (
        <EmptyAttribute></EmptyAttribute>
      )}

      <Modal
        isOpen={Boolean(currentEditId)}
        toggle={closeModal}
        title="Update User Manual"
      >
        <UserManualForm
          onSubmit={handleSubmitForm}
          onCancel={closeModal}
          defaultValues={manuals.find((manual) => manual.id === currentEditId)}
          submitting={updateManualInfo.loading}
        />
      </Modal>
      <Footer />
    </div>
  );
}

interface UserManualFormValues {
  id: string;
  name?: string | null;
  resuploadBase64?: string;
}

interface UserManualFormProps {
  onSubmit: (values: UserManualFormValues) => void;
  onCancel?: () => void;
  submitting?: boolean;
  defaultValues?: UserManualFormValues;
  create?: boolean;
}

function UserManualForm({
  onSubmit,
  create,
  onCancel,
  defaultValues,
  submitting,
}: UserManualFormProps) {
  const { register, setValue, handleSubmit } = useForm<UserManualFormValues>({
    defaultValues,
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input innerRef={register} name="name" label="Name" />
      <FileInputPdf
        name="resuploadBase64"
        register={register}
        setValue={setValue}
      />
      <div className="d-flex justify-content-end">
        <Button
          type="button"
          onClick={onCancel}
          className="pwc cancel mr-2"
          color="secondary"
        >
          Cancel
        </Button>
        <Button loading={submitting} className="pwc px-5" color="primary">
          {create ? "Submit" : "Update"}
        </Button>
      </div>
    </form>
  );
}
