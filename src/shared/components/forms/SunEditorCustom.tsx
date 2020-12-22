import React, { useRef } from "react";
import SunEditor, { SunEditorReactProps } from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css"; // Import Sun Editor's CSS File

export default function SunEditorCustom(props: SunEditorReactProps) {
  const ref = useRef<any>();

  // strip font-weight on paste
  function handlePaste(e: any, cleanData: string, maxCharCount: any) {
    const data = cleanData.replace(
      /font-weight: (bold|bolder|lighter|normal);|font-weight: \d\d\d;|font-style:(italic|normal);/gi,
      ""
    );
    ref.current?.editor.insertHTML(data, false, true);
    // ref.current?.editor.insertHTML(cleanData, true, true);
  }

  return (
    <SunEditor
      showToolbar
      enable
      show
      enableToolbar
      // @ts-ignore
      ref={ref}
      setOptions={{
        showPathLabel: false,
        imageUploadSizeLimit: 10485760,
        linkProtocol: "http://",
        minHeight: "30vh",
        height: "auto",
        font: [
          "Serif",
          "Sans Serif",
          "Monospace",
          "Candara",
          "Verdana",
          "Arial",
          "Twentieth Century",
          "Calibri",
          "Georgia",
          "Abadi",
          "Helvetica",
          "Garamond",
          "Bookman",
          "Arial Nova Cond",
          "Bahnschrift",
          "Selawik",
          "Perpetua",
        ],
        buttonList: [
          ["font", "fontSize", "align", "list", "outdent", "indent"],
          ["fontColor", "hiliteColor", "bold", "underline", "italic"],
          ["image", "table", "link"],
        ],
      }}
      // onPaste={handlePaste}
      {...props}
    />
  );
}
