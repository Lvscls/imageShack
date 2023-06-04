import React, { createContext, useEffect, useState } from "react";
import getUrl from "../urlconfig";
export const UserContext = createContext();

export const UserProvider = (props) => {
  const [token, setToken] = useState(localStorage.getItem("accesToken"));
  const url = getUrl();
  useEffect(() => {
    const fetchUser = async () => {
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await fetch(
        `${url}/api/users/me`,
        requestOptions
      );

      if (!response.ok) {
        setToken(null);
      }
      localStorage.setItem("accesToken", token);
    };
    fetchUser();
  }, [token]);

  return (
    <UserContext.Provider value={[token, setToken]}>
        {props.children}
    </UserContext.Provider>
  )
};
