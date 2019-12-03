import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useHistory } from "react-router-dom";

function HeaderWithBackButton({ heading = "Heading" }) {
  const history = useHistory();
  const handleClick = () => history.goBack();

  return (
    <div className="d-flex">
      <a className="blue-anchor mr-3" onClick={handleClick}>
        <FaArrowLeft />
      </a>
      &nbsp;
      <h4 className="text-orange">{heading}</h4>
    </div>
  );
}

export default HeaderWithBackButton;
