import React, { useState } from "react";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import { NavLink as RrNavLink, Link } from "react-router-dom";
import pwcLogo from "../../assets/images/pwc-logo.png";
import styled from "styled-components";
import { FaBell, FaBookmark } from "react-icons/fa";
import { unauthorize } from "../../redux/auth";
import { useDispatch } from "react-redux";
import Avatar from "./Avatar";
import useAccessRights from "../hooks/useAccessRights";
import { useNotificationsCountQuery } from "../../generated/graphql";
import NotificationBadge from "./NotificationBadge";

const adminMenus = [
  { label: "Policy", path: "/policy-admin" },
  { label: "Policy Category", path: "/policy-category" },
  { label: "Control", path: "/control" },
  { label: "User", path: "/user" },
  { label: "Business Process", path: "/business-process" },
  { label: "References", path: "/references" },
  { label: "Resources", path: "/resources" },
  { label: "Risks", path: "/risk" }
];

const userMenus = [
  { label: "Policy", path: "/policy" },
  { label: "Risk & Control", path: "/risk-and-control" },
  { label: "Reports", path: "/report" },
  { label: "Administrative", path: "/", children: adminMenus },
  { label: "Settings", path: "/settings" }
];

const NewNavbar = () => {
  const dispatch = useDispatch();
  const rolesArray = useAccessRights([
    "admin",
    "admin_preparer",
    "admin_reviewer"
  ]);
  const isMereUser = rolesArray.every(() => false);
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(p => !p);

  function handleLogout() {
    dispatch(unauthorize());
  }

  const unreadCount =
    useNotificationsCountQuery({ fetchPolicy: "network-only" }).data
      ?.notifications?.metadata.totalCount || 0;

  return (
    <div>
      <Navbar fixed="top" expand="md">
        <LogoContainer className="pl-5">
          <NavbarBrand href="/">
            <Image src={pwcLogo} alt="PwC" className="img-fluid" />
          </NavbarBrand>
        </LogoContainer>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="mr-auto" navbar>
            {userMenus
              // If the current user role is a 'mere' user,
              // don't let him access 'Administrative' menu.
              .filter(userMenu => {
                if (isMereUser) {
                  return userMenu.label !== "Administrative";
                }
                return true;
              })
              .map(userMenu => {
                const { label, path, children } = userMenu;
                if (label === "Administrative") {
                  return (
                    <UncontrolledDropdown key={label} nav inNavbar>
                      <DropdownToggle
                        nav
                        caret
                        className="nav_item_dropdown text-bold"
                      >
                        {label}
                      </DropdownToggle>
                      <DropdownMenu right className="p-0 dropdown__menu">
                        {Array.isArray(children) &&
                          children.map(childMenu => (
                            <DropdownItem key={childMenu.label} className="p-0">
                              <NavItem key={childMenu.label}>
                                <NavLink
                                  tag={RrNavLink}
                                  to={childMenu.path}
                                  className="p-3 dropdown__nav"
                                  activeClassName="dropdown__active"
                                  activeStyle={{
                                    color: "white"
                                  }}
                                >
                                  {childMenu.label}
                                </NavLink>
                              </NavItem>
                            </DropdownItem>
                          ))}
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  );
                }
                return (
                  <NavItem key={label} className="px-2 py-0 text-bold">
                    <NavLink
                      tag={RrNavLink}
                      to={path}
                      className="nav_item"
                      activeClassName="active"
                    >
                      {label}
                    </NavLink>
                  </NavItem>
                );
              })}
          </Nav>
        </Collapse>
        <div className="d-flex align-items-center pr-2">
          <div className="mr-3">
            <Link to="/bookmark" className="text-dark">
              <FaBookmark className="clickable" size={22} />
            </Link>
          </div>
          <div className="mr-4">
            <Link to="/notifications" className="text-dark">
              <NotificationBadge count={unreadCount} />
              <FaBell size={22} />
            </Link>
          </div>
          <Avatar data={[{ label: "Logout", onClick: handleLogout }]} />
        </div>
      </Navbar>
    </div>
  );
};

export default NewNavbar;

const Image = styled.img`
  width: 50px;
  height: auto;
`;

const LogoContainer = styled.div`
  width: 330px;
`;
