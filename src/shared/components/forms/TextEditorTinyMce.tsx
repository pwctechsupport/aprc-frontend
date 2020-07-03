import React, { useEffect, Fragment } from "react";
import { Editor } from "@tinymce/tinymce-react";

export interface TextEditorProps {
  onChange?: any;
  invalid?: any;
  error?: any;
  name?: any;
  register?: any;
  defaultValue?: any;
}
const TextEditorField = ({
  onChange,
  error,
  name,
  defaultValue,
  register,
}: TextEditorProps) => {
  useEffect(() => {
    register({ name });
  }, [name, register]);
  return (
    <Fragment>
      <Editor
        // apiKey="59bj10y8kde63ifl3evajz27378spyev5hukdkbdbxk3dqks"
        onChange={onChange}
        initialValue={defaultValue}
        init={{
          font_formats:
            "Sans Serif=sans-serif;Serif=serif;Monospace=monospace;Candara=candara;Verdana=verdana;Arial=arial;Twentieth Century=twentieth-century;Calibri=calibri;Georgia=georgia;Abadi=abadi;Helvetica=helvetica;Garamond=garamond;Bookman=bookman;Arial Nova Cond=arial-nova-cond;Bahnschrift=bahnschrift;Selawik=selawik;Perpetua=perpetua",
          // selector: "textarea",
          images_dataimg_filter: function(img: any) {
            return img.hasAttribute("internal-base64");
          },
          branding: false,
          images_upload_handler: function(
            blobInfo: any,
            success: any,
            failure: any
          ) {
            if (blobInfo.blob().size < 4085830) {
              success(
                `data:${blobInfo.blob().type};base64,${blobInfo.base64()}`
              );
            } else {
              failure("Maximum file uploaded is 5 MB");
            }
          },
          // images_upload_base_path: "/some/basepath",
          // paste_data_images: true,
          // height: 500,
          // menubar: false,
          plugins: [
            "advlist autolink lists link image charmap print preview anchor",
            "searchreplace visualblocks code fullscreen",
            "insertdatetime media table paste code help wordcount",
            "image",
          ],

          toolbar:
            "undo redo |fontselect fontsizeselect| formatselect | bold italic backcolor |  alignleft aligncenter alignright alignjustify |  bullist numlist outdent indent | removeformat | link image table",
        }}
      />
      <div style={{ color: "#e46773", fontSize: "12px" }}>{error}</div>
    </Fragment>
  );
};

export default TextEditorField;
