import { useDispatch } from "react-redux";
import { openDialogBox } from "../../redux/dialogBox";

export default function useDialogBox() {
  const dispatch = useDispatch();
  function dialog({
    title,
    text,
    callback
  }: {
    callback: Function;
    title?: string;
    text?: string;
  }) {
    dispatch(
      openDialogBox({
        title: title || "Confirmation",
        callback,
        text: text || "Are you sure?"
      })
    );
  }
  return dialog;
}
