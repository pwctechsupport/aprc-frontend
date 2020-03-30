import React, { useState } from "react";
import Helmet from "react-helmet";
import { useForm } from "react-hook-form";
import { AiOutlineClockCircle } from "react-icons/ai";
import { FaDownload, FaPencilAlt } from "react-icons/fa";
import { Col, Row, Table } from "reactstrap";
import {
  useManualsQuery,
  useUpdateManualMutation
} from "../../generated/graphql";
import Button from "../../shared/components/Button";
import FileInput from "../../shared/components/forms/FileInput";
import Input from "../../shared/components/forms/Input";
import Modal from "../../shared/components/Modal";
import Tooltip from "../../shared/components/Tooltip";
import { date } from "../../shared/formatter";
import useAccessRights from "../../shared/hooks/useAccessRights";
import { notifyGraphQLErrors, notifySuccess } from "../../shared/utils/notif";

export default function UserManual() {
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);
  const isAdminReviewer = useAccessRights(["admin_reviewer"]).every(Boolean);
  const manuals =
    useManualsQuery({ fetchPolicy: "network-only" }).data?.manuals
      ?.collection || [];
  const [updateManual, updateManualInfo] = useUpdateManualMutation({
    onCompleted: () => {
      notifySuccess("User Manual Updated");
      closeModal();
    },
    onError: notifyGraphQLErrors,
    refetchQueries: ["manuals"],
    awaitRefetchQueries: true
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
  return (
    <div>
      <Helmet>
        <title>User Manual - Settings - PricewaterhouseCoopers</title>
      </Helmet>
      <h4>User Manual</h4>
      <br />
      <Row>
        <Col xs={12}>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>File Size</th>
                <th>File Type</th>
                <th>Last updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {manuals.map(manual => (
                <tr key={manual.id} className="">
                  <td className="text-bold">{manual.name}</td>
                  <td>{manual.fileSize}</td>
                  <td>{manual.fileType}</td>
                  <td>
                    <AiOutlineClockCircle className="mr-1" />
                    {date(manual.updatedAt)}
                  </td>
                  <td>
                    <div className="d-flex justify-content-between align-items-center">
                      <Tooltip description="Download User Manual">
                        <Button
                          className="soft orange"
                          color=""
                          onClick={() =>
                            handleDownload(
                              `http://mandalorian.rubyh.co${manual.resuploadUrl}`,
                              manual.name || ""
                            )
                          }
                        >
                          <FaDownload />
                        </Button>
                      </Tooltip>
                      {isAdminReviewer && (
                        <Tooltip description="Edit User Manual">
                          <Button
                            onClick={() => setCurrentEditId(manual.id)}
                            className="soft red"
                            color=""
                          >
                            <FaPencilAlt />
                          </Button>
                        </Tooltip>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Modal
        isOpen={Boolean(currentEditId)}
        toggle={closeModal}
        title="Update User Manual"
      >
        <UserManualForm
          onSubmit={handleSubmitForm}
          onCancel={closeModal}
          defaultValues={manuals.find(manual => manual.id === currentEditId)}
          submitting={updateManualInfo.loading}
        />
      </Modal>
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
}

function UserManualForm({
  onSubmit,
  onCancel,
  defaultValues,
  submitting
}: UserManualFormProps) {
  const { register, setValue, handleSubmit } = useForm<UserManualFormValues>({
    defaultValues
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input innerRef={register} name="name" label="Name" />
      <FileInput
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
          Update
        </Button>
      </div>
    </form>
  );
}
