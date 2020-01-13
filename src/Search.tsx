import React from "react";
import { withNavbar } from "./Navbar";

const Search: React.FC = withNavbar(() => {
  return (
    <div>
      <h1>Search</h1>
    </div>
  );
});

export default Search;
