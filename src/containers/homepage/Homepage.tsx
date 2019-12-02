import React from "react";
import { unauthorize } from "../../redux/auth";
import { useDispatch } from "react-redux";

const Homepage = () => {
  const dispatch = useDispatch();
  return (
    <div>
      <h1>This is HOME</h1>
      <button onClick={() => dispatch(unauthorize())}>Log out</button>
    </div>
  );
};

export default Homepage;
