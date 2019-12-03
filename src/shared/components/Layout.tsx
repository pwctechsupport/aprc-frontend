import React from "react";
import Navbar from "./Navbar";

const Layout: React.FC = ({ children }) => {
  return (
    <div>
      <Navbar />
      <div className="p-5">{children}</div>
    </div>
  );
};

export default Layout;
