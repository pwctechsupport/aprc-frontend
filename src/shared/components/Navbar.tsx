import React, { useState } from "react";
import { NavLink, RouteComponentProps, useHistory } from "react-router-dom";
import pwcLogo from "../../assets/images/pwc-logo.png";
import styled from "styled-components";
import { FaBell, FaBookmark, FaChevronDown } from "react-icons/fa";
import Avatar from "./Avatar";
import { useDispatch } from "react-redux";
import { unauthorize } from "../../redux/auth";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

const menus = [
  { label: "Policy", path: "/policy" },
  { label: "Control", path: "/control" },
  { label: "Business Process", path: "/business-process" },
  { label: "References", path: "/references" },
  { label: "Resources", path: "/resources" }
];

const Navbar = () => {
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(unauthorize());
  }

  return (
    <NavbarContainer>
      <Image src={pwcLogo} alt="pwc" />
      <AdministrativeDropdown />
      <div className="d-flex justify-content-space-between align-items-center">
        <div className="mr-3">
          <FaBookmark />
        </div>
        <div className="mr-4">
          <FaBell />
        </div>
        <Avatar data={[{ label: "Logout", onClick: handleLogout }]} />
      </div>
    </NavbarContainer>
  );
};

const AdministrativeDropdown = () => {
  const history = useHistory();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const data = menus.map(menu => ({
    label: menu.label,
    onClick: () => history.push(menu.path)
  }));
  const toggle = () => setDropdownOpen(prevState => !prevState);
  return (
    <Dropdown isOpen={dropdownOpen} toggle={toggle}>
      <DropdownToggle tag="div">
        <div className="clickable">
          <MyNavSpan>Administrative</MyNavSpan> <FaChevronDown />
        </div>
      </DropdownToggle>
      <DropdownMenu>
        {data.map((item, index) => (
          <DropdownItem key={index} onClick={item.onClick}>
            {item.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
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

const MyNavLink = styled(NavLink)`
  text-decoration: none;
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  line-height: 20px;
  color: #3a3838;
`;

const MyNavSpan = styled.span`
  text-decoration: none;
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  line-height: 20px;
  color: #3a3838;
`;

export default Navbar;
