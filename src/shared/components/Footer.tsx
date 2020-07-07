import React, { Fragment } from "react";
const Footer = () => {
  return (
    <Fragment>
      <hr />
      <div className="justify-content-center d-flex">
        <p style={{ position: "relative", color: "rgba(0,0,0,.5)" }}>
          &copy; 2020 PwC. PwC all rights reserved. PwC refers to the PwC
          network and/or one or more of its member firms, each of which is a
          separate legal entity. Please see www.pwc.com/structure for further
          details.
        </p>
      </div>
    </Fragment>
  );
};
export default Footer;
