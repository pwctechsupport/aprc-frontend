import React from "react";
import Navbar from "./Navbar";

const Layout: React.FC = ({ children }) => {
  return (
    <div>
      <Navbar />
      <div className="p-sm-1 p-md-2 p-lg-5">{children}</div>
    </div>
  );
};

export default Layout;
