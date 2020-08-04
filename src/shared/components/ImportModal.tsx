import React, { useState } from "react";
import MyApi from "../utils/api";
import { notifySuccess, notifyError } from "../utils/notif";
import Modal from "./Modal";
import { Input } from "reactstrap";
import Button from "./Button";

const ImportModal = ({
  isOpen,
  toggle,
  title,
  endpoint,
  onCompleted,
  onError,
}: ImportModalProps) => {
  const [file, setFile] = useState();
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);

  function handleSetFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (
        file.type !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        setError("File type not supported. Allowed type are: .xls, .xlsx");
      } else {
        setError(null);
        setFile(file);
      }
    }
  }

  async function handleImport() {
    const formData = new FormData();
    formData.append("file", file);
    try {
      setLoading(true);
      const rawData = await MyApi.put(endpoint, formData);
      toggle();
      onCompleted && onCompleted();
      if (
        rawData.data.error_data !== undefined &&
        rawData.data.error_data.length !== 0
      ) {
        return notifyError(
          rawData.data.error_data
            .slice(0, 4)
            .map(
              (a: any) =>
                `Error in line ${a.line}, Error message: ${a.message} `
            ),
          {
            autoClose: 10000,
          }
        );
      } else {
        notifySuccess(`${title} Success`);
        setInterval(function() {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      setError("Error uploading document");
      notifyError(`${title} Failed`);
      onError && onError();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} title={title} toggle={toggle}>
      <Input type="file" onChange={handleSetFile} />
      {error && <h6 className="text-red mt-2">{error}</h6>}
      <div className="d-flex justify-content-end mt-3">
        <Button
          className="pwc"
          onClick={handleImport}
          disabled={!file || !!error}
          loading={loading}
        >
          Import
        </Button>
      </div>
    </Modal>
  );
};

export default ImportModal;

interface ImportModalProps {
  isOpen: boolean;
  toggle: () => void;
  title: string;
  endpoint: string;
  onCompleted?: Function;
  onError?: Function;
}
