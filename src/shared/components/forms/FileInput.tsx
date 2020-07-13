import React, { useState, useEffect } from "react";
import { toBase64 } from "../../formatter";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import styled, { css } from "styled-components";
import { FormText } from "reactstrap";

interface FileInputProps {
  name: string;
  register: Function;
  setValue: Function;
  supportedFileTypes?: string[];
  supportedFileTypesFlowchart?: string[];
  onFileSelect?: (data: string) => void;
  errorForm?: string;
  flowchart?: boolean;
}

const defaultSupportedFileTypes = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];
const flowchartSupportedFileTypes = ["image/jpeg", "image/png"];
export default function FileInput({
  name,
  register,
  errorForm,
  flowchart,
  setValue,
  supportedFileTypesFlowchart = flowchartSupportedFileTypes,
  supportedFileTypes = defaultSupportedFileTypes,
  onFileSelect,
}: FileInputProps) {
  const fileTypeErrorMsg = !flowchart
    ? "File type not supported. Supported types are PDF, Docs, PNG and JPG/JPEG."
    : "File type not supported. Supported types are PNG and JPG/JPEG.";

  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string>();
  const [targetFile, setTargetFile] = useState();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    register({ name: name, type: "custom" });
  }, [register, name]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    e.stopPropagation();
    e.persist();
    setTargetFile(e.target.files);
    if (e.target.files && e.target.files[0]) {
      if (supportedFileTypes.includes(e.target.files[0].type)) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result as string);
          onFileSelect?.(reader.result as string);
        };
        reader.readAsDataURL(e.target.files[0]);
        setError(null);
        setValue(name, String(await toBase64(e.target.files[0])), true);
      } else {
        setError(fileTypeErrorMsg);
      }
    }
  }
  async function handleFileSelectFlowchart(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    e.preventDefault();
    e.stopPropagation();
    e.persist();
    if (e.target.files && e.target.files[0]) {
      if (supportedFileTypesFlowchart.includes(e.target.files[0].type)) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result as string);
          onFileSelect?.(reader.result as string);
        };
        reader.readAsDataURL(e.target.files[0]);

        setError(null);
        setValue(name, String(await toBase64(e.target.files[0])), true);
      } else {
        setError(fileTypeErrorMsg);
      }
    }
  }
  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    e.persist();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (
        flowchart
          ? supportedFileTypesFlowchart.includes(e.dataTransfer.files[0].type)
          : supportedFileTypes.includes(e.dataTransfer.files[0].type)
      ) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result as string);
          onFileSelect?.(reader.result as string);
        };
        reader.readAsDataURL(e.dataTransfer.files[0]);
        setError(null);
        setValue(name, String(await toBase64(e.dataTransfer.files[0])), true);
      } else {
        setError(fileTypeErrorMsg);
      }
    }
  }

  function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragging(true);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDragLeave() {
    setDragging(false);
  }

  return (
    <div>
      <Wrapper
        dragging={dragging}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {preview?.includes("image/jpeg") || preview?.includes("image/png") ? (
          <PreviewImg src={preview} alt={"preview-img"} />
        ) : preview?.includes("application/pdf") ||
          preview?.includes(
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          ) ? (
          `${targetFile && targetFile[0].name} `
        ) : flowchart ? (
          <PreviewImg src={preview} />
        ) : null}
        {dragging ? "Release File" : "Drag File Here"}
        {!dragging && <span className="mx-2">Or</span>}
        <UploadButton hidden={dragging} className="custom-file-upload">
          <HiddenInput
            type="file"
            onChange={!flowchart ? handleFileSelect : handleFileSelectFlowchart}
          />
          Select File
        </UploadButton>
      </Wrapper>
      {error && (
        <span className="text-danger">
          <AiOutlineExclamationCircle />
          &nbsp;{error}
        </span>
      )}
      {errorForm && (
        <FormText className="text-danger pl-3" color="red">
          {errorForm}
        </FormText>
      )}
    </div>
  );
}

const UploadButton = styled.label`
  cursor: pointer;
  display: unset;
  margin-bottom: unset;
  padding: 5px;
  margin: 0px 4px;
  border-radius: 3px;
  transition: background 0.1s ease-out 0s;
  background: none rgb(244, 245, 247);
  &:hover {
    background-color: rgb(235, 236, 240);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const Wrapper = styled.div<{ dragging?: boolean }>`
  margin: 0.5rem 0;
  padding: 20px;
  border: 1px dashed grey;
  border-radius: 3px;
  transition: 0.5s cubic-bezier(0.455, 0.03, 0.515, 0.955);
  font-size: big;
  font-weight: bold;
  ${(p) =>
    p.dragging &&
    css`
      background: green;
      color: white;
    `}
`;

const PreviewImg = styled.img`
  height: 70px;
  margin-right: 10px;
`;
