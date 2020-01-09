import React from "react";
import styled from "styled-components";

function HeaderWithBackButton({ heading = "Heading" }) {
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
