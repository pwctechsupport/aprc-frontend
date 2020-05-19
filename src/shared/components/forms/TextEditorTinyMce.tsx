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
  console.log("data", data?.level?.content);
  return (
    <Editor
      apiKey="59bj10y8kde63ifl3evajz27378spyev5hukdkbdbxk3dqks"
      value={data || ""}
      onChange={onChange}
      init={{
        selector: "textarea",
        images_upload_handler: function(
          blobInfo: any,
          success: any,
          failure: any
        ) {
          var xhr: any, formData;
          xhr = new XMLHttpRequest();
          xhr.withCredentials = false;
          xhr.open("POST", "postAcceptor.php");
          xhr.onload = function() {
            var json;
            if (xhr.status != 200) {
              failure("HTTP Error: " + xhr.status);
              return;
            }
            json = JSON.parse(xhr.responseText);
            if (!json || typeof json.location != "string") {
              failure("Invalid JSON: " + xhr.responseText);
              return;
            }
            success(json.location);
          };
          formData = new FormData();
          formData.append("file", blobInfo.blob(), blobInfo.filename());
          xhr.send(formData);
          console.log("blobInfo", blobInfo.base64());
        },
        // images_upload_base_path: "/some/basepath",
        paste_data_images: true,
        // height: 500,
        // menubar: false,
        plugins: [
          "advlist autolink lists link image charmap print preview anchor",
          "searchreplace visualblocks code fullscreen",
          "insertdatetime media table paste code help wordcount",
          "image code",
        ],
        toolbar:
          "undo redo | formatselect | bold italic backcolor | \
        alignleft aligncenter alignright alignjustify | \
        bullist numlist outdent indent | removeformat | help| link image",
      }}
    />
  );
};

export default TextEditorField;
