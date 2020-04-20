import React from "react";
import classnames from "classnames";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
// import QuillBetterTable from 'quill-better-table'
export interface TextEditorProps {
  wrapperClassName?: string;
  data?: string;
  onChange?: (content: string) => void;
  invalid?: boolean;
}

const fontSize = Quill.import("attributors/style/size");
const defaultFontSize = 13;
const fontSizes = [16, 18, 20, 24, 30];
fontSize.whitelist = [
  `${defaultFontSize}px`,
  ...fontSizes.map((s) => `${s}px`),
];
Quill.register(fontSize, true);

const QuillCustomToolbar = () => (
  <div id="toolbar">
    <span className="ql-formats">
      <select className="ql-font"></select>
    </span>
    <span className="ql-formats">
      <select
        className="ql-header"
        defaultValue={""}
        onChange={(e) => e.persist()}
      >
        <option value="1"></option>
        <option value="2"></option>
        <option selected></option>
      </select>
    </span>
    <span className="ql-formats">
      <select className="ql-size">
        <option selected>{defaultFontSize}</option>
        {fontSizes.map((size) => {
          return (
            <option key={size} value={`${size}px`}>
              {size}
            </option>
          );
        })}
      </select>
    </span>
    <span className="ql-formats">
      <button className="ql-bold"></button>
      <button className="ql-italic"></button>
      <button className="ql-underline"></button>
      <button className="ql-strike"></button>
      <button className="ql-blockquote"></button>
    </span>
    <span className="ql-formats">
      <select className="ql-color"></select>
      <select className="ql-background"></select>
    </span>
    <span className="ql-formats">
      <select className="ql-align"></select>
      <button className="ql-list" value="ordered"></button>
      <button className="ql-list" value="bullet"></button>
      <button className="ql-indent" value="-1"></button>
      <button className="ql-indent" value="+1"></button>
    </span>
    <span className="ql-formats">
      <button className="ql-link"></button>
      <button className="ql-image"></button>
    </span>
    <span className="ql-formats">
      <button className="ql-clean"></button>
    </span>
  </div>
);

const TextEditor = ({
  data,
  onChange,
  wrapperClassName,
  invalid,
}: TextEditorProps) => {
  return (
    <div
      className={classnames([
        "editor-wrapper",
        wrapperClassName,
        invalid && "invalid",
      ])}
    >
      <QuillCustomToolbar />
      <ReactQuill
        value={data || ""}
        onChange={onChange}
        modules={{
          toolbar: {
            container: "#toolbar",
          },
        }}
        formats={[
          "header",
          "size",
          "bold",
          "italic",
          "underline",
          "color",
          "background",
          "font",
          "align",
          "strike",
          "blockquote",
          "list",
          "bullet",
          "indent",
          "link",
          "image",
        ]}
      />
    </div>
  );
};

export default TextEditor;
