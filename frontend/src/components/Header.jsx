import React, { useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import getUrl from "../urlconfig";
import jwt_decode from "jwt-decode";

const Header = ({ title }) => {
  const [token, setToken] = useContext(UserContext);
  const url = getUrl();
  const handleLogout = () => {
    setToken(null);
  };

  const handleDeleteAccount = async (userId) => {
    console.log(userId)

    const requestOptions = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await fetch(`${url}/api/users/${userId}`, requestOptions);

    if (response.ok) {
      setToken(null);
    } else {
      console.error("Error deleting user account");
    }
  };

  return (
    <div className="has-text-centered m-6">
      <h1 className="title">{title}</h1>
      {token && (
        <div>
          <button className="button" onClick={handleLogout}>
            Logout
          </button>
          <button
            className="button is-danger ml-2"
            onClick={() => handleDeleteAccount(jwt_decode(token).id)}
          >
            Delete Account
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;
