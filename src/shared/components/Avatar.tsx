import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Dropdown, DropdownMenu, DropdownToggle } from "reactstrap";
import styled from "styled-components";
import { useSelector } from "../hooks/useSelector";
import Button from "./Button";

interface DataType {
  onClick?: () => void;
  label: string | undefined;
  header?: boolean;
}

interface AvatarProps {
  data: DataType[];
}

export default function Avatar({ data }: AvatarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const name = user?.name || "";

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  return (
    <Dropdown isOpen={dropdownOpen} toggle={toggle}>
      <DropdownToggle tag="div">
        <AvatarIcon src="https://reactnativecode.com/wp-content/uploads/2018/01/2_img.png" />
      </DropdownToggle>
      <DropdownMenu right className="mr-3 mt-3">
        {data.map((item, index) => (
          <div
            key={index}
            className="d-flex flex-column p-4"
            style={{ width: 300 }}
          >
            <div className="d-flex flex-column justify-content-center align-items-center mb-3">
              <DropdownAvatarIcon src="https://reactnativecode.com/wp-content/uploads/2018/01/2_img.png" />
              {user ? (
                <h4>
                  {!name.includes(" ")
                    ? name.split("")[0].toUpperCase()
                    : name.split("")[0].toUpperCase() +
                      " " +
                      name
                        .split(" ")[1]
                        .split("")[0]
                        .toUpperCase()}
                </h4>
              ) : null}
            </div>
            <div className="d-flex justify-content-between">
              {user ? (
                <>
                  <UserDetailTitle>Email</UserDetailTitle>
                  <UserDetail>{user.email}</UserDetail>
                </>
              ) : null}
            </div>
            <div className="d-flex justify-content-between">
              {user ? (
                <>
                  <UserDetailTitle>Phone</UserDetailTitle>
                  <UserDetail>{user.phone}</UserDetail>
                </>
              ) : null}
            </div>
            <Button
              tag={Link}
              to="/settings"
              outline
              color=""
              className="soft orange mt-4"
              onClick={toggle}
            >
              Settings
            </Button>
            <Button onClick={item.onClick} color="primary" className="pwc mt-2">
              Log out
            </Button>
          </div>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}

const AvatarIcon = styled.img`
  display: inline-block;
  position: relative;
  outline: 0px;
  height: 44px;
  width: 44px;
  border-radius: 50%;
  cursor: pointer;
`;

const DropdownAvatarIcon = styled.img`
  display: inline-block;
  position: relative;
  outline: 0px;
  height: 80px;
  width: 80px;
  border-radius: 50%;
`;

const UserDetailTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
`;

const UserDetail = styled.div`
  font-size: 14px;
`;
