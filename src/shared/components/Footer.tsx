import React, { Fragment, useState, useEffect } from "react";
const Footer = () => {
  function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  }

  function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(
      getWindowDimensions()
    );

    useEffect(() => {
      function handleResize() {
        setWindowDimensions(getWindowDimensions());
      }

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return windowDimensions;
  }
  const { width } = useWindowDimensions();
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
        className="justify-content-center   "
        style={{
          borderTop: "1px solid #E7E7E7",
          padding: "5px",
          position: "fixed",
          bottom: "-5px",
          height: `${
            475 < width && width < 936 ? "80px" : width < 475 ? "100px" : "60px"
          }`,
          // width: "100%",
        }}
      >
        <p
          style={{
            // position: "fixed",
            textAlign: "center",
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
