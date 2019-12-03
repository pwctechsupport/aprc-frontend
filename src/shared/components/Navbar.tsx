import React from "react";
import { NavLink } from "react-router-dom";
import pwcLogo from "../../assets/images/pwc-logo.png";
import styled from "styled-components";
import { FaBell, FaBookmark } from "react-icons/fa";
import Avatar from "@atlaskit/avatar";

const menus = [
  { label: "Policy", path: "/policy" },
  { label: "Risk & Control", path: "/risk-and-control" },
  { label: "Control & Risk Management", path: "/control-and-risk-management" },
  { label: "Report", path: "/report" },
  { label: "Administrative", path: "/administrative" }
];

const Navbar = () => {
  return (
    <NavbarContainer>
      <Image src={pwcLogo} alt="pwc" />
      <NavbarUl>
        {menus.map((menu, index) => (
          <NavbarLi key={index}>
            <Hmmm to={menu.path}>{menu.label}</Hmmm>
            {/* <ActiveIndicator /> */}
          </NavbarLi>
        ))}
      </NavbarUl>
      <div className="d-flex justify-content-space-between">
        <div className="mr-3">
          <FaBookmark />
        </div>
        <div>
          <FaBell />
        </div>
      </div>
      <Avatar
        src="https://reactnativecode.com/wp-content/uploads/2018/01/2_img.png"
        presence="online"
        size="large"
      />
    </NavbarContainer>
  );
};

const NavbarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 45px 0 45px;
  border: 1px solid #bfbfbf;
  height: 55px;
`;

const Image = styled.img`
  width: 50px;
  height: auto;
`;

const NavbarUl = styled.ul`
  list-style-type: none;
  display: inline;
  margin: 0;
`;

const NavbarLi = styled.li`
  display: inline;
  margin: 20px;
`;

const Hmmm = styled(NavLink)`
  text-decoration: none;
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  line-height: 20px;
  color: #3a3838;
`;

export default Navbar;
