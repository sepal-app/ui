import React from "react";

import { withNavbar } from "./Navbar";


const Home: React.FC = withNavbar(() => {
  console.log("Home()");
  return (
    <div>
      <div>Home</div>
    </div>
  );
});

export default Home;
