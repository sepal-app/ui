import React from "react";
import "./App.css";
import Router from "./Router";
import Navbar from "./Navbar";

const App: React.FC = () => {
  return (
    <>
      <Navbar />
      <Router />
    </>
  );
};

export default App;
