import React from "react";
import { Route, RouteProps, Redirect } from "react-router-dom";

const AuthRoute = (props: RouteProps) => {
  const token = localStorage.getItem("token");
  console.log("token:", !!token);
  if (!token) return <Redirect to="/auth" />;

  return <Route {...props} />;
};

export default AuthRoute;
