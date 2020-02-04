import React from "react";
import NewNavbar from "./NewNavbar";
import styled from "styled-components";

const Layout: React.FC = ({ children }) => {
  return (
    <div>
      <NewNavbar />
      <DivWithPaddingTop>{children}</DivWithPaddingTop>
    </div>
  );
};

export default Layout;

const DivWithPaddingTop = styled.div`
  padding-top: 63px;
`;
