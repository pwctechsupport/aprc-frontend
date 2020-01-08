import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

function HeaderWithBackButton({ heading = "Heading" }) {
  const history = useHistory();
  const handleClick = () => history.goBack();

  return (
    <div className="d-flex align-items-center">
      {/* <div className="blue-anchor mr-3 clickable" onClick={handleClick}>
        <FaArrowLeft />
      </div> */}
      <Heading className="text-orange">{heading}</Heading>
    </div>
  );
}

export default HeaderWithBackButton;

const Heading = styled.div`
  font-size: 22px;
  font-weight: 600;
`;
