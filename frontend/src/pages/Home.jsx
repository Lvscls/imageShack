import React from "react";
import { Link } from "react-router-dom";
import Gallery from "../components/Gallery";

const Home = () => {
  return (
    <div>
      <h1>Home</h1>
      <Link to="/authentification">Authentification</Link>
      <Gallery />
    </div>
  );
};
export default Home;
