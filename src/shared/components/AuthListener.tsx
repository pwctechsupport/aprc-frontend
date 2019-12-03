import { useEffect } from "react";
import { RouteComponentProps } from "react-router";
import { useSelector } from "../hooks/useSelector";
import { useDispatch } from "react-redux";
import { authorize } from "../../redux/auth";

const AuthListener = ({ history }: RouteComponentProps) => {
  const isAuthed = useSelector(state => state.auth.isAuthed);
  const dispatch = useDispatch();
  useEffect(() => {
    if (isAuthed) {
      // history.push("/");
    } else {
      const token = localStorage.getItem("token");
      if (token) {
        dispatch(authorize({ email: "", name: "" }, token));
        // history.push("/");
      } else {
        history.push("/auth");
      }
    }
  }, [isAuthed, history, dispatch]);
  return null;
};

export default AuthListener;