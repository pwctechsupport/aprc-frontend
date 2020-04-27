import React from "react";
import classnames from "classnames";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../../../../src/index.css";

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

var Font = Quill.import("formats/font");
Font.whitelist = [
  "monospace",
  "serif",
  "candara",
  "verdana",
  "arial",
  "twentieth-century",
  "calibri",
  "georgia",
  "abadi",
  "times-new-roman",
  "helvetica",
  "garamond",
  "bookman",
  "arial-nova-cond",
  "bahnschrift",
  "selawik",
  "perpetua",
];
Quill.register(Font, true);

const QuillCustomToolbar = () => (
  <div id="toolbar">
    <span className="ql-formats">
      <select className="ql-font" defaultValue="sans-serif">
        <option value="sans-serif">Sans Serif</option>
        <option value="serif">Serif</option>
        <option value="monospace">Monospace</option>
        <option value="candara">Candara</option>
        <option value="verdana">Verdana</option>
        <option value="arial">Arial</option>
        <option value="twentieth-century">Twentieth Century</option>
        <option value="calibri">Calibri</option>
        <option value="georgia">Georgia</option>
        <option value="abadi">Abadi</option>
        <option value="helvetica">Helvetica</option>
        <option value="garamond">Garamond</option>
        <option value="bookman">Bookman</option>
        <option value="arial-nova-cond">Arial Nova Cond</option>
        <option value="bahnschrift">Bahnschrift</option>
        <option value="selawik">Selawik</option>
        <option value="perpetua">Perpetua</option>
      </select>
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
