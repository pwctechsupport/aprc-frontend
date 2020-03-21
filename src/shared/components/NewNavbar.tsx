import React, { useState } from "react";
import { FaBell, FaBookmark } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { Link, NavLink as RrNavLink } from "react-router-dom";
import {
  Collapse,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  NavLink,
  UncontrolledDropdown
} from "reactstrap";
import styled from "styled-components";
import pwcLogo from "../../assets/images/pwc-logo.png";
import { useNotificationsCountQuery } from "../../generated/graphql";
import { unauthorize } from "../../redux/auth";
import useAccessRights from "../hooks/useAccessRights";
import Avatar from "./Avatar";
import NotificationBadge from "./NotificationBadge";

export default function NewNavbar() {
  const dispatch = useDispatch();
  const rolesArray = useAccessRights([
    "admin",
    "admin_preparer",
    "admin_reviewer"
  ]);
  const isMereUser = rolesArray.every(a => !a);
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(p => !p);

  function handleLogout() {
    dispatch(unauthorize());
  }

  const { data } = useNotificationsCountQuery({
    fetchPolicy: "network-only"
  });

  const unreadCount = data?.notifications?.metadata.totalCount || 0;
  const showNotif = data?.me?.notifShow || false;

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
                                  activeClassName="dropdown__active text-white"
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
                      exact={path === "/"}
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
              {showNotif && <NotificationBadge count={unreadCount} />}
              <FaBell size={22} />
            </Link>
          </div>
          <Avatar data={[{ label: "Logout", onClick: handleLogout }]} />
        </div>
      </Navbar>
    </div>
  );
}

// =============================================
// Available Routes
// =============================================

const userMenus = [
  { label: "Home", path: "/" },
  { label: "Policy", path: "/policy" },
  { label: "Risk & Control", path: "/risk-and-control" },
  { label: "Reports", path: "/report" },
  {
    label: "Administrative",
    path: "/",
    children: [
      { label: "Policy", path: "/policy-admin" },
      { label: "Policy Category", path: "/policy-category" },
      { label: "Policy Reference", path: "/references" },
      { label: "Control", path: "/control" },
      { label: "User", path: "/user" },
      { label: "Business Process", path: "/business-process" },
      { label: "Resources", path: "/resources" },
      { label: "Risks", path: "/risk" }
    ]
  },
  { label: "Settings", path: "/settings" }
];

// =============================================
// Styled Components
// =============================================

const Image = styled.img`
  width: 50px;
  height: auto;
`;

const LogoContainer = styled.div`
  width: 330px;
`;
