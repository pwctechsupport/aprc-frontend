import React, { useState, useEffect } from "react";
import { toBase64 } from "../../formatter";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import styled, { css } from "styled-components";

interface FileInputProps {
  name: string;
  register: Function;
  setValue: Function;
  supportedFileTypes?: string[];
  onFileSelect?: (data: string) => void;
}

const defaultSupportedFileTypes = ["application/pdf"];

export default function FileInputPdf({
  name,
  register,
  setValue,
  supportedFileTypes = defaultSupportedFileTypes,
  onFileSelect,
}: FileInputProps) {
  const fileTypeErrorMsg = "File type not supported. Only supported pdf file";
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    register({ name: name, type: "custom" });
  }, [register, name]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    e.stopPropagation();
    e.persist();
    if (e.target.files && e.target.files[0]) {
      if (supportedFileTypes.includes(e.target.files[0].type)) {
        const reader = new FileReader();
        const hjcodisa = e.target.files[0].name ? e.target.files[0].name : "";
        reader.onload = () => {
          setPreview(hjcodisa);
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
      if (supportedFileTypes.includes(e.dataTransfer.files[0].type)) {
        const hjcodisa = e.dataTransfer.files[0].name
          ? e.dataTransfer.files[0].name
          : "";

        const reader = new FileReader();
        reader.onload = () => {
          setPreview(hjcodisa);
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
        {preview ? preview : null}

        {preview === "" ? (dragging ? "Release File" : "Drag File Here") : ""}
        {preview === "" ? !dragging && <span className="mx-2">Or</span> : ""}
        {preview === "" ? (
          <UploadButton hidden={dragging} className="custom-file-upload">
            <HiddenInput type="file" onChange={handleFileSelect} />
            Select File
          </UploadButton>
        ) : (
          ""
        )}
      </Wrapper>
      {error && (
        <span className="text-danger">
          <AiOutlineExclamationCircle />
          &nbsp;{error}
        </span>
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

// const PreviewImg = styled.img`
//   height: 70px;
//   margin-right: 10px;
// `;
