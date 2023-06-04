import React, { useContext, useEffect, useState } from "react";

import Register from "../components/Register";
import Header from "../components/Header";
import Login from "../components/Login";
import { UserContext } from "../contexts/UserContext";
import ImageUploader from "../components/ImageUploader";
import UserImages from "../components/UserImages";
import { Link } from "react-router-dom";
import getUrl from "../urlconfig";

const Authentification = () => {
  const [message, setMessage] = useState("");
  const [token] = useContext(UserContext);
  const url = getUrl();

  const getWelcomeMessage = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await fetch(`${url}/api`, requestOptions);
    const data = await response.json();

    if (!response.ok) {
      console.log("something messed up");
    } else {
      setMessage(data.message);
    }
  };

  useEffect(() => {
    getWelcomeMessage();
  }, []);

  return (
    <>
      <Header title={message} />
      <div className="columns">
        <div className="column"></div>
        <div className="column m-5 is-two-thirds">
          <Link to="/">Back</Link>
          {!token ? (
            <div className="columns">
              <Register />
              <Login />
            </div>
          ) : (
            <>
              <ImageUploader />
              <UserImages token={token} />
            </>
          )}
        </div>
        <div className="column"></div>
      </div>
    </>
  );
};

export default Authentification;
