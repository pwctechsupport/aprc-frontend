import React from "react";
import { useDispatch } from "react-redux";
import { unauthorize } from "../../redux/auth";
import Button from "../../shared/components/Button";

const Homepage = () => {
  const dispatch = useDispatch();
  return (
    <div>
      <h1>Welcome to PWC App</h1>
      <h4>
        Please navigate using <strong>Navigation Bar</strong> at the top
      </h4>
      <Button onClick={() => dispatch(unauthorize())} color="danger mt-5">
        Log out
      </Button>
    </div>
  );
};

export default Homepage;
