import React from "react";
import { useSelector } from "react-redux";
import { Redirect, Route, RouteProps } from "react-router-dom";

const AuthRoute = (props: RouteProps) => {
  const token = localStorage.getItem("token");

  const isAuthed = useSelector((state: any) => state.auth.isAuthed)

  if (!token || !isAuthed) return <Redirect to="/auth" />;

  return <Route {...props} />;
};

export default AuthRoute;
