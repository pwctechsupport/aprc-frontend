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
import { toggleModal } from "../../redux/modal";
import { useDispatch } from "react-redux";
import Avatar from "./Avatar";

const adminMenus = [
  { label: "Policy", path: "/policy" },
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
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(p => !p);
  const handleToggle = () => dispatch(toggleModal("bookmark"));

  function handleLogout() {
    dispatch(unauthorize());
  }

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
            {userMenus.map(userMenu => {
              const { label, path, children } = userMenu;
              if (label === "Administrative") {
                return (
                  <UncontrolledDropdown key={label} nav inNavbar>
                    <DropdownToggle nav caret>
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
                <NavItem key={label} className="px-2 py-0">
                  <NavLink
                    tag={RrNavLink}
                    to={path}
                    activeClassName="nav_item__active"
                    activeStyle={{
                      fontWeight: "bold"
                    }}
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
            {/* <FaBookmark
              onClick={handleToggle}
              className="clickable"
              size={22}
            /> */}

            <Link to="/bookmark" className="text-dark">
              <FaBookmark className="clickable" size={22} />
            </Link>
          </div>
          <div className="mr-4">
            <FaBell size={22} />
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
