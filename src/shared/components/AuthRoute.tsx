import React from "react";
import { Route, RouteProps, Redirect } from "react-router-dom";

const AuthRoute = ({ component, ...props }: RouteProps) => {
  const token = localStorage.getItem("userToken");
  console.log("token:", token);

  if (!token) return <Redirect to="/auth" />;

  return <Route {...props} />;
};

export default AuthRoute;
