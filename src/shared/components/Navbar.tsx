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
      <FaBookmark />
      <FaBell />
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
  padding: 0 20px 0 20px;
  border: 1px solid #bfbfbf;
`;

const Image = styled.img`
  width: 75px;
  height: auto;
`;

const NavbarUl = styled.ul`
  list-style-type: none;
  display: inline;
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

// const ActiveIndicator = styled.div`
//   background: #d85604;
//   border-radius: 5px 5px 0px 0px;
//   width: 10px;
//   height: 3px;
//   display: inline-flex;
//   flex-direction: column;
// `;

// const Profile = styled.div`
//   background: url("https://reactnativecode.com/wp-content/uploads/2018/01/2_img.png");
//   background-repeat: no-repeat;
//   width: 75px;
//   height: 75px;
//   border-radius: 50%;
//   background-position: center;
//   background-size: contain;
//   display: inline-block;
// `;

export default Navbar;
