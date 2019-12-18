import React, { useState } from "react";
import { FaBell, FaBookmark, FaChevronDown } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useHistory, NavLink } from "react-router-dom";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle
} from "reactstrap";
import styled from "styled-components";
import pwcLogo from "../../assets/images/pwc-logo.png";
import { unauthorize } from "../../redux/auth";
import Avatar from "./Avatar";
import { useSelector } from "../hooks/useSelector";
import { oc } from "ts-optchain";
import { toggleModal } from "../../redux/modal";

const adminMenus = [
  { label: "Policy", path: "/policy" },
  { label: "Control", path: "/control" },
  { label: "Business Process", path: "/business-process" },
  { label: "References", path: "/references" },
  { label: "Resources", path: "/resources" },
  { label: "Risks", path: "/risk" }
];

const userMenus = [
  { label: "Policy", path: "/policy/dashboard" },
  { label: "Risk & Control", path: "/policy" },
  { label: "Control & Risk Management", path: "/policy" },
  { label: "Report", path: "/policy" }
];

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const email = oc(user).email("");
  const handleToggle = () => dispatch(toggleModal("bookmark"));

  function handleLogout() {
    dispatch(unauthorize());
  }

  return (
    <NavbarContainer>
      <Image src={pwcLogo} alt="pwc" />
      <NavbarUl>
        {userMenus.map(item => (
          <NavbarLi key={item.label}>
            <MyNavLink to={item.path}>{item.label}</MyNavLink>
          </NavbarLi>
        ))}
      </NavbarUl>
      <AdministrativeDropdown />
      <div className="d-flex justify-content-space-between align-items-center">
        <Avatar
          data={[
            { label: email, header: true },
            { label: "Logout", onClick: handleLogout }
          ]}
        />
        <div className="mx-4">
          <FaBookmark onClick={handleToggle} className="clickable" />
        </div>
        <div>
          <FaBell />
        </div>
      </div>
    </NavbarContainer>
  );
};

const AdministrativeDropdown = () => {
  const history = useHistory();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const data = adminMenus.map(menu => ({
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
