import React, { useState, useEffect } from "react";
interface FooterProps {
  fontColor?: string;
  linebreak?: boolean;
  origin?: string;
}
const Footer = ({ fontColor = "", linebreak, origin }: FooterProps) => {
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
          textAlign: 'left',
          color: fontColor ? fontColor : 'rgba(0,0,0,.5)',
          marginLeft: origin === 'login' ? 0 : '7px',
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
