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
import { NavLink as RrNavLink } from "react-router-dom";
import pwcLogo from "../../assets/images/pwc-logo.png";
import styled from "styled-components";

const adminMenus = [
  { label: "Policy", path: "/policy" },
  { label: "Control", path: "/control" },
  { label: "Business Process", path: "/business-process" },
  { label: "References", path: "/references" },
  { label: "Resources", path: "/resources" },
  { label: "Risks", path: "/risk" }
];

const userMenus = [
  { label: "Policy", path: "/policy" },
  { label: "Risk & Control", path: "/risk-and-control" },
  { label: "Report", path: "/report" },
  { label: "Admin", path: "/", children: adminMenus }
];

const NewNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(p => !p);

  return (
    <div>
      <Navbar color="light" fixed="top" light expand="md">
        <NavbarBrand href="/">
          <Image src={pwcLogo} alt="PwC" className="img-fluid" />
        </NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="mr-auto" navbar>
            {userMenus.map(userMenu => {
              const { label, path, children } = userMenu;
              if (label === "Admin") {
                return (
                  <UncontrolledDropdown key={label} nav inNavbar>
                    <DropdownToggle nav caret>
                      {label}
                    </DropdownToggle>
                    <DropdownMenu right>
                      {Array.isArray(children) &&
                        children.map(childMenu => (
                          <DropdownItem key={childMenu.label}>
                            <NavItem key={childMenu.label}>
                              <NavLink tag={RrNavLink} to={childMenu.path}>
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
                <NavItem key={label}>
                  <NavLink tag={RrNavLink} to={path}>
                    {label}
                  </NavLink>
                </NavItem>
              );
            })}
          </Nav>
        </Collapse>
      </Navbar>
    </div>
  );
};

export default NewNavbar;

const Image = styled.img`
  width: 50px;
  height: auto;
`;
