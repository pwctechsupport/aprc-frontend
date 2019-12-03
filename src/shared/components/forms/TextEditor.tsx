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
    "bold",
    "italic",
    "blockQuote",
    // 'ckfinder',
    // 'imageTextAlternative',
    "imageUpload",
    // 'imageStyle:full',
    // 'imageStyle:side',
    // "indent",
    // "outdent",
    "numberedList",
    "bulletedList",
    "|",
    "link",
    "mediaEmbed"
    // 'insertTable',
    // 'tableColumn',
    // 'tableRow',
    // 'mergeTableCells',
  ]
};

export default TextEditor;
