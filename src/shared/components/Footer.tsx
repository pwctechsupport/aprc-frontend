import React, { Fragment } from "react";
const Footer = () => {
  return (
    <div
      style={{
        display: "block",
        padding: "20px",
        height: "60px",
        width: "100%",
      }}
    >
      <div
        className="justify-content-center d-flex  "
        style={{
          // backgroundColor: "#F8F8F8",
          borderTop: "1px solid #E7E7E7",
          padding: "5px",
          position: "fixed",
          bottom: "-5px",
          height: "40px",
          // width: "100%",
        }}
      >
        <p
          style={{
            // position: "fixed",
            color: "rgba(0,0,0,.5)",
          }}
        >
          &copy; 2020 PwC. PwC all rights reserved. PwC refers to the PwC
          network and/or one or more of its member firms, each of which is a
          separate legal entity. Please see www.pwc.com/structure for further
          details.
        </p>
      </div>
    </div>
  );
};
export default Footer;
