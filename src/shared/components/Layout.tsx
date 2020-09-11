import React from "react";
import Navbar from "./Navbar";
import styled from "styled-components";

const Layout: React.FC = ({ children }) => {
  return (
    <div>
      <Navbar />
      <DivWithPaddingTop>{children}</DivWithPaddingTop>
    </div>
  );
};

export default Layout;

const DivWithPaddingTop = styled.div`
  padding-top: 63px;
  @media (max-width: 992px) {
    padding-top: 100px;
  }
`
