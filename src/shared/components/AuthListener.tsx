import { useEffect } from "react";
import { RouteComponentProps } from "react-router";
import { useSelector } from "../hooks/useSelector";

const AuthListener = ({ history }: RouteComponentProps) => {
  const isAuthed = useSelector(state => state.auth.isAuthed);
  useEffect(() => {
    if (isAuthed) {
      history.push("/");
    } else {
      history.push("/auth");
    }
  }, [isAuthed, history]);
  return null;
};

export default AuthListener;
