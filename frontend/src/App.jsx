import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Authentification from "./pages/Authentification";

const App = () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/authentification" element={<Authentification />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
