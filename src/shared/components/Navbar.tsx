import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
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
  NavbarText,
  NavbarToggler,
  NavItem,
  NavLink,
  Row,
  UncontrolledDropdown,
} from "reactstrap";
import styled from "styled-components";
import PickIcon from "../../assets/Icons/PickIcon";
import pwcLogoOutline from "../../assets/images/pwc-logo-outline-black.png";
import { H1 } from "../../containers/auth/Login";
import HomepageSearch from "../../containers/homepage/HomepageSearch";
import { useNotificationsCountQuery } from "../../generated/graphql";
import { unauthorize } from "../../redux/auth";
import useAccessRights from "../hooks/useAccessRights";
import useWindowSize from "../hooks/useWindowSize";
import Avatar from "./Avatar";
import NotificationBadge from "./NotificationBadge";

export default function NewNavbar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const rolesArray = useAccessRights([
    "admin",
    "admin_preparer",
    "admin_reviewer",
  ]);
  const currentUrl = location.pathname;
  const isMereUser = rolesArray.every((a) => !a);
  const size = useWindowSize();
  const isBigScreen = size.width > 896;
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen((p) => !p);
  function handleLogout() {
    dispatch(unauthorize());
  }
  const isMobile = size.width < 768;
  const isLaptop = size.width > 991;
  useEffect(() => {
    setIsOpen((p) => (p ? !p : p));
  }, [setIsOpen, location.pathname]);

  const { data } = useNotificationsCountQuery({
    fetchPolicy: "network-only",
  });

  const unreadCount = data?.notifications?.metadata.totalCount || 0;
  const showNotif = data?.me?.notifShow || false;
  const underlineDecider = (path: any) => {
    if (path === currentUrl) {
      return <Underline className="mx-2"></Underline>;
    }
  };
  return (
    <NavbarWithColor fixed="top" light expand="lg">
      <StyledNavbarBrand tag={Link} to="/">
        <Row>
          <Image src={pwcLogoOutline} alt="PwC" className="ml-2 "/>
          <Straightline/>
          <H1
            style={{ paddingTop: isMobile ? "5px" : "10px", marginBottom: 0 }}
            className="ml-2 mt-4"
          >
            eGRC
          </H1>
        </Row>
      </StyledNavbarBrand>
      <NavbarToggler onClick={toggle} />
      <Collapse isOpen={isOpen} navbar>
        <Nav className="mr-auto" navbar>
          {userMenus
            .filter((menu) =>
              isBigScreen || isMobile
                ? isMereUser
                  ? menu.label !== "Administrative" && menu.label !== "Settings"
                  : menu.label !== "Settings"
                : true
            )
            .map(({ label, path, children, dropdown }) => {
              if (dropdown) {
                return (
                  <UncontrolledDropdown key={label} nav inNavbar>
                    <StyledDropdownToggle
                      style={{ fontSize: "15px", paddingTop: "15px" }}
                      nav
                      caret
                    >
                      {label}
                    </StyledDropdownToggle>
                    <StyledDropdownMenu right className="p-0">
                      {children?.map((childMenu) => (
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
                    isLaptop={isLaptop}
                    tag={RrNavLink}
                    to={path}
                    exact={path === "/"}
                    activeClassName="active"
                    style={{
                      fontSize: "15px",
                      paddingTop: "15px",
                    }}
                  >
                    {label}
                  </StyledNavLink>
                  {isLaptop && underlineDecider(path)}
                </NavItem>
              );
            })}
        </Nav>
        <NavbarText>
          <div className="d-flex align-items-center">
            <SearchBar className="mr-4">
              <HomepageSearch
                navBar
                placeholder="Search policies..."
                maxMenuWidth={500}
              />
            </SearchBar>
            <SearchPolicies>
              <Link
                to={`${
                  rolesArray.every((a) => a === false)
                    ? "/search-policy?status_eq=release"
                    : "/search-policy"
                }`}
                className="text-dark mr-4"
              >
                <FaSearch className="clickable" size={22} />
              </Link>
            </SearchPolicies>
            <Link to="/bookmark" className="text-dark ml-2">
              <PickIcon name="bookmark" style={{ width: "35px" }} />
            </Link>
            <div className="ml-4 mr-4">
              <Link to="/notifications" className="text-dark">
                {showNotif && <NotificationBadge count={unreadCount} />}
                <PickIcon name="notif" style={{ width: "35px" }} />
              </Link>
            </div>
            <Avatar data={[{ label: "Logout", onClick: handleLogout }]} />
          </div>
        </NavbarText>
      </Collapse>
    </NavbarWithColor>
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
    dropdown: true,
    path: "/",
    children: [
      { label: "Policy", path: "/policy" },
      { label: "Policy category", path: "/policy-category" },
      { label: "Policy reference", path: "/references" },
      { label: "Control", path: "/control" },
      { label: "User", path: "/user" },
      { label: "Business process", path: "/business-process" },
      { label: "Resources", path: "/resources" },
      { label: "Risks", path: "/risk" },
    ],
  },
  {
    label: "Settings",
    dropdown: true,
    path: "/",
    children: [
      { label: "Profile", path: "/settings/update-profile" },
      // { label: "Notifications", path: "/settings/notifications" },
      { label: "History", path: "/settings/history" },
      { label: "User Manual", path: "/settings/user-manual" },
    ],
  },
];

// =============================================
// Styled Components
// =============================================
const NavbarWithColor = styled(Navbar)`
  padding-top: 25px;
  height: 90px;
  background-color: white;
  border-bottom: 1px solid var(--soft-grey);
`;
const Straightline = styled.p`
  border-left: 2px solid var(--darker-grey);
  height: 30px;
  margin: 29px 7px;
`
const Underline = styled.div`
  position: relative;
  height: 5px;
  background-color: var(--orange);
  top: 8px;
  left: 0;
`;
const Image = styled.img`
  margin: -10px -14px 19px -20px;
  width: auto;
  height: 90px;
  @media only screen and (max-width: 767px) {
    height: 35px;
  }
`;
const SearchBar = styled.div`
  width: 15em;
  @media only screen and (max-width: 1183px) {
    display: none;
  }
`;

const StyledNavbarBrand = styled(NavbarBrand)`
  width: calc(10vw - 20px);
  @media only screen and (max-width: 1400px) {
    width: unset;
  }
  @media only screen and (max-width: 1183px) {
    width: 20vw;
  }
  @media only screen and (max-width: 991px) {
    width: unset;
  }
`;
const SearchPolicies = styled.div`
  display: none;
  @media only screen and (max-width: 1183px) {
    display: block;
  }
`;
const StyledNavLink = styled(NavLink)<{ isLaptop?: boolean }>`
  color: rgba(0, 0, 0, 0.8) !important;
  font-weight: bold;
  letter-spacing: 1px;
  transition: 0.15s ease-in-out;
  &:hover {
    color: var(--orange) !important;
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
      background: ${(p) => (p.isLaptop ? "" : "var(--orange)")};
    }
  }
  @media only screen and (min-width: 1081px) {
    margin: 0px 0.5rem;
  }
  @media only screen and (max-width: 896px) {
    &.active {
      color: var(--orange) !important;
    }
  }
`;

const StyledDropdownMenu = styled(DropdownMenu)`
  background: var(--soft-grey) !important;
  margin-top: -15px;
  right: -12px;
`;

const StyledDropdownToggle = styled(DropdownToggle)`
  color: rgba(0, 0, 0, 0.8) !important;
  letter-spacing: 1px;
  transition: 0.15s ease-in-out;
  font-weight: bold;
  &:hover {
    color: var(--orange) !important;
  }
`;

const StyledDropdownNavLink = styled(NavLink)`
  color: var(--black) !important;
  &:hover {
    background: var(--orange) !important;
  }
  &:active {
    background: unset;
    color: unset;
  }
  &.active {
    background: var(--orange) !important;
    color: white !important;
    &:hover {
      background: var(--orange) !important;
    }
  }
`;
