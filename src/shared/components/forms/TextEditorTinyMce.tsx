import React from "react";
import { Editor } from "@tinymce/tinymce-react";

export interface TextEditorProps {
  data?: any;
  onChange?: any;
  invalid?: any;
  error?: any;
}
const TextEditorField = ({
  data,
  onChange,
  invalid,
  error,
}: TextEditorProps) => {
  return (
    <Editor
      apiKey="59bj10y8kde63ifl3evajz27378spyev5hukdkbdbxk3dqks"
      value={data || ""}
      onChange={onChange}
      init={{
        selector: "textarea",
        images_dataimg_filter: function(img: any) {
          return img.hasAttribute("internal-base64");
        },
        images_upload_handler: function(
          blobInfo: any,
          success: any,
          failure: any
        ) {
          if (blobInfo.blob().size < 4085830) {
            success(`data:${blobInfo.blob().type};base64,${blobInfo.base64()}`);
          } else {
            failure("Maximum file uploaded is 5 MB");
          }
        },
        // images_upload_base_path: "/some/basepath",
        paste_data_images: true,
        // height: 500,
        // menubar: false,
        plugins: [
          "advlist autolink lists link image charmap print preview anchor",
          "searchreplace visualblocks code fullscreen",
          "insertdatetime media table paste code help wordcount",
          "image",
        ],

        toolbar:
          "undo redo | formatselect | bold italic backcolor | \
        alignleft aligncenter alignright alignjustify | \
        bullist numlist outdent indent | removeformat | link image",
      }}
    />
  );
};

export default TextEditorField;
