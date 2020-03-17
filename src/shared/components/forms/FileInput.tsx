import React, { useState, useEffect } from "react";
import { toBase64 } from "../../formatter";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import styled, { css } from "styled-components";

interface FileInputProps {
  name: string;
  register: Function;
  setValue: Function;
  supportedFileTypes?: string[];
}

const defaultSupportedFileTypes = ["image/jpeg", "image/png"];

export default function FileInput({
  name,
  register,
  setValue,
  supportedFileTypes = defaultSupportedFileTypes
}: FileInputProps) {
  const fileTypeErrorMsg =
    "File type not supported. Supported types are PNG and JPG/JPEG.";
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string>();
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
        setError(null);
        setValue(name, String(await toBase64(e.target.files[0])), true);
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(e.target.files[0]);
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

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    e.persist();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (supportedFileTypes.includes(e.dataTransfer.files[0].type)) {
        setError(null);
        setValue(name, String(await toBase64(e.dataTransfer.files[0])), true);
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(e.dataTransfer.files[0]);
      } else {
        setError(fileTypeErrorMsg);
      }
    }
  }

  return (
    <div>
      {preview ? (
        <div>
          <img src={preview} alt="" className="img-fluid" />
        </div>
      ) : null}
      <Wrapper
        dragging={dragging}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {dragging ? "Release File" : "Drag File Here"}
        {!dragging && <span className="mx-2">Or</span>}
        <UploadButton hidden={dragging} className="custom-file-upload">
          <HiddenInput type="file" onChange={handleFileSelect} />
          Select File
        </UploadButton>
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
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.1);
  transition: 0.3s linear;
  &:hover {
    background: rgba(0, 0, 0, 0.3);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const Wrapper = styled.div<{ dragging?: boolean }>`
  margin: 0.5rem 0;
  padding: 20px;
  border: 1px dashed grey;
  border-radius: 5px;
  transition: 0.5s cubic-bezier(0.455, 0.03, 0.515, 0.955);
  font-size: big;
  font-weight: bold;
  ${p =>
    p.dragging &&
    css`
      background: green;
      color: white;
    `}
`;
