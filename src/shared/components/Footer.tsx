import React, { useState, useEffect } from "react";
interface FooterProps {
  fontColor?: string;
  linebreak?: boolean;
}
const Footer = ({ fontColor = "", linebreak }: FooterProps) => {
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
    <div className="footer">
      <p
        style={{
          textAlign: 'center',
          color: fontColor ? fontColor : 'rgba(0,0,0,.5)',
        }}
      >
        &copy; 2020 PwC. PwC all rights reserved. PwC refers to the PwC network
        and/or one or more of its member firms, each of which is a separate
        legal entity.{linebreak && <br />}
        Please see www.pwc.com/structure for further details.
      </p>
    </div>
  )
};
export default Footer;
