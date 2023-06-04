import React, { useEffect, useState } from "react";
import getUrl from "../urlconfig";
const UserImages = ({ token }) => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isPublic, setIsPublic] = useState(false);
  const [message, setMessage] = useState("");
  const url = getUrl();
  const getPrivateImages = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await fetch(
      `${url}/api/images/private`,
      requestOptions
    );
    const data = await response.json();

    if (!response.ok) {
      console.error("Error fetching private images:", data);
    } else {
      setImages(data);
    }
  };

  const getImage = async (imageId) => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await fetch(
      `${url}/api/images/${imageId}`,
      requestOptions
    );
    const data = await response.json();

    if (!response.ok) {
      console.error(`Error fetching image ${imageId}:`, data);
    } else {
      setSelectedImage(data);
      setIsPublic(data.is_public);
    }
  };

  const handleImageClick = (imageId) => {
    getImage(imageId);
  };

  const handleTogglePublic = () => {
    setIsPublic(!isPublic);
  };

  const handleSaveImage = async () => {
    if (selectedImage) {
      const requestOptions = {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      };
      const response = await fetch(
        `${url}/api/images/${selectedImage.id}?is_public=${isPublic}`,
        requestOptions
      );
      const data = await response.json();

      if (!response.ok) {
        console.error(`Error updating image ${selectedImage.id}:`, data);
      } else {
        // Image updated successfully
        setMessage("Image updated successfully");
        // Refresh the images list
        getPrivateImages();
      }
    }
  };

  const handleDeleteImage = async () => {
    if (selectedImage) {
      const requestOptions = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await fetch(
        `${url}/api/images/${selectedImage.id}`,
        requestOptions
      );

      if (!response.ok) {
        console.error(`Error deleting image ${selectedImage.id}`);
      } else {
        // Image deleted successfully
        setMessage("Image deleted successfully");
        // Refresh the images list
        getPrivateImages();
        // Clear the selected image
        setSelectedImage(null);
        setIsPublic(false);
      }
    }
  };

  useEffect(() => {
    if (token) {
      getPrivateImages();
    }
  }, [token]);

  return (
    <div>
       {message && (
        <div className="notification is-success">
          <button
            className="delete"
            onClick={() => setMessage("")}
          ></button>
          {message}
        </div>
      )}
      {selectedImage && (
        <div>
          <h2>Edit Image</h2>
          {/* Display the selected image for editing */}
          <img
            src={`${url}/${selectedImage.url}`}
            alt={`Image ${selectedImage.id}`}
          />
          {/* Add editing controls here */}
          <div>
            <label>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={handleTogglePublic}
              />{" "}
              Public
            </label>
          </div>
          <button onClick={handleSaveImage}>Save Image</button>
          <button onClick={handleDeleteImage}>Delete Image</button>
          <br />
          <br />
        </div>
      )}
      <div className="columns is-multiline">
        {images.map((image) => (
          <div
            key={image.id}
            className="column is-one-third"
            onClick={() => handleImageClick(image.id)}
          >
            <figure className="image">
              <img
                src={`${url}/${image.url}`}
                alt={`Image ${image.id}`}
              />
            </figure>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserImages;
