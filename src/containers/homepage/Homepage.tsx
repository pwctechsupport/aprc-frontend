import React from "react";
import { useDispatch } from "react-redux";
import { unauthorize } from "../../redux/auth";
import Button from "../../shared/components/Button";

const Homepage = () => {
  const dispatch = useDispatch();
  return (
    <div>
      <h1>This is HOME</h1>
      <Button primary onClick={() => dispatch(unauthorize())}>
        Log out
      </Button>
    </div>
  );
};

export default Homepage;
