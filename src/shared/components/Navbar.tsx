import React, { useState, useEffect } from "react";
import { FaBell, FaBookmark, FaSearch } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { Link, NavLink as RrNavLink, useLocation } from "react-router-dom";
import {
  Collapse,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavbarText,
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
import HomepageSearch from "../../containers/homepage/HomepageSearch";

export default function NewNavbar() {
  const dispatch = useDispatch();
  const location = useLocation();
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

  useEffect(() => {
    setIsOpen(p => (p ? !p : p));
  }, [setIsOpen, location.pathname]);

  const { data } = useNotificationsCountQuery({
    fetchPolicy: "network-only"
  });

  const unreadCount = data?.notifications?.metadata.totalCount || 0;
  const showNotif = data?.me?.notifShow || false;

  return (
    <Navbar fixed="top" color="light" light expand="md">
      <StyledNavbarBrand tag={Link} to="/">
        <Image src={pwcLogo} alt="PwC" />
      </StyledNavbarBrand>
      <NavbarToggler onClick={toggle} />
      <Collapse isOpen={isOpen} navbar>
        <Nav className="mr-auto" navbar>
          {userMenus
            // If the current user role is a 'mere' user,
            // don't let him access 'Administrative' menu.
            .filter(menu =>
              isMereUser ? menu.label !== "Administrative" : true
            )
            .map(({ label, path, children }) => {
              if (label === "Administrative") {
                return (
                  <UncontrolledDropdown key={label} nav inNavbar>
                    <StyledDropdownToggle nav caret>
                      {label}
                    </StyledDropdownToggle>
                    <StyledDropdownMenu right className="p-0">
                      {children?.map(childMenu => (
                        <DropdownItem key={childMenu.label} className="p-0">
                          <NavItem key={childMenu.label}>
                            <StyledDropdownNavLink
                              tag={RrNavLink}
                              to={childMenu.path}
                              className="px-2 py-1 py-md-2"
                              activeClassName="active"
                            >
                              {childMenu.label}
                            </StyledDropdownNavLink>
                          </NavItem>
                        </DropdownItem>
                      ))}
                    </StyledDropdownMenu>
                  </UncontrolledDropdown>
                );
              }
              return (
                <NavItem key={label}>
                  <StyledNavLink
                    tag={RrNavLink}
                    to={path}
                    exact={path === "/"}
                    activeClassName="active"
                  >
                    {label}
                  </StyledNavLink>
                </NavItem>
              );
            })}
        </Nav>
        <NavbarText>
          <div className="d-flex align-items-center">
            <SearchBar className="mr-4">
              <HomepageSearch />
            </SearchBar>
            <div className="ml-4 mr-4">
              <Link to="/search-policy" className="text-dark">
                <FaSearch className="clickable" size={22} />
              </Link>
            </div>
            <Link to="/bookmark" className="text-dark">
              <FaBookmark className="clickable" size={22} />
            </Link>
            <div className="ml-4 mr-4">
              <Link to="/notifications" className="text-dark">
                {showNotif && <NotificationBadge count={unreadCount} />}
                <FaBell size={22} />
              </Link>
            </div>
            <Avatar data={[{ label: "Logout", onClick: handleLogout }]} />
          </div>
        </NavbarText>
      </Collapse>
    </Navbar>
  );
}

// =============================================
// Available Routes
// =============================================

const userMenus = [
  { label: "Home", path: "/" },
  { label: "Policy", path: "/policy" },
  { label: "Risk & Control", path: "/risk-and-control" },
  { label: "Exception Report", path: "/report" },
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
  }
];

// =============================================
// Styled Components
// =============================================

const Image = styled.img`
  width: 50px;
  height: auto;
`;

const SearchBar = styled.div`
  width: 15em;
  @media only screen and (max-width: 977px) {
    display: none;
  }
`;

const StyledNavbarBrand = styled(NavbarBrand)`
  width: calc(25vw - 20px);
  @media only screen and (max-width: 977px) {
    width: unset;
  }
`;

const StyledNavLink = styled(NavLink)`
  color: rgba(0, 0, 0, 0.8) !important;
  font-weight: bold;
  letter-spacing: 1px;
  transition: 0.15s ease-in-out;
  &:hover {
    color: var(--primary-color) !important;
  }
  &::after {
    content: "";
    display: block;
    margin-top: 5px;
    height: 2px;
    width: 100%;
  }
  &.active {
    &::after {
      background: var(--primary-color);
    }
  }
  @media only screen and (min-width: 1027px) {
    margin: 0px 0.5rem;
  }
  @media only screen and (max-width: 767px) {
    &.active {
      color: var(--primary-color) !important;
    }
  }
`;

const StyledDropdownMenu = styled(DropdownMenu)`
  background: var(--soft-orange) !important;
`;

const StyledDropdownToggle = styled(DropdownToggle)`
  color: rgba(0, 0, 0, 0.8) !important;
  letter-spacing: 1px;
  transition: 0.15s ease-in-out;
  font-weight: bold;
  &:hover {
    color: var(--primary-color) !important;
  }
`;

const StyledDropdownNavLink = styled(NavLink)`
  color: var(--primary-color) !important;
  &:hover {
    background: var(--pale-primary-color) !important;
  }
  &:active {
    background: unset;
    color: unset;
  }
  &.active {
    background: var(--primary-color) !important;
    color: white !important;
    &:hover {
      background: var(--primary-color) !important;
    }
  }
`;
