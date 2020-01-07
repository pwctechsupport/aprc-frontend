import React from "react";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@sarhanm/ckeditor5-build-classic-full-with-base64-upload";
import classnames from "classnames";
import { Class } from "@babel/types";

interface TextEditorProps {
  wrapperClassName?: string;
  editor?: Class;
  data?: string;
  onChange?: (event: any, editor: any) => void;
  invalid?: boolean;
}

const TextEditor = ({
  editor = ClassicEditor,
  data,
  onChange,
  wrapperClassName,
  invalid
}: TextEditorProps) => {
  return (
    <div
      className={classnames([
        "editor-wrapper",
        wrapperClassName,
        invalid && "invalid"
      ])}
    >
      <CKEditor
        plugin={[]}
        editor={editor}
        config={config}
        data={data}
        onChange={onChange}
      />
    </div>
  );
};

const config = {
  toolbar: [
    "undo",
    "redo",
    "|",
    "heading",
    "fontSize",
    "|",
    "bold",
    "underline",
    "italic",
    "blockQuote",
    "|",
    "numberedList",
    "bulletedList",
    "|",
    "link",
    "imageUpload"
  ]
};

export default TextEditor;
