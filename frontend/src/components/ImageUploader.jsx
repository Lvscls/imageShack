import React, { useState } from "react";
import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import getUrl from "../urlconfig";

const ImageUploader = () => {
  const [file, setFile] = useState(null);
  const [token] = useContext(UserContext);
  const url = getUrl();
  const handleImageUpload = async () => {
    const formData = new FormData();
    formData.append("image", file);

    const requestOptions = {
      method: "POST",
      "Content-Type": "multipart/form-data",
      'Origin': ['http://localhost:3000','vps-fb4cc13a.vps.ovh.net:3000'],
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }

    const response = await fetch(`${url}/api/images`, requestOptions);
    if (response.ok) {
      console.log("Image uploaded successfully");
    } else {
      console.error("Failed to upload image");
    }

    // L'image a été téléchargée avec succès
  };

  const handleFileSelect = (e) => {
    const imageFile = e.target.files[0];
    if (imageFile) {
      setFile(imageFile);
    }
  };

  return (
    <>
      <p className="mb-10">Drag and drop ton image ou clique sur le bouton</p>
      <div
        onDrop={(e) => {
          e.preventDefault();
          const files = Array.from(e.dataTransfer.files);
          const imageFile = files.find((file) =>
            file.type.startsWith("image/")
          );
          if (imageFile) {
            setFile(imageFile);
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        style={{
          width: "900px",
          height: "200px",
          border: "dashed 2px gray",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "auto",
        }}
      >
        <input type="file" onChange={handleFileSelect} accept="image/*" />
        {file && (
          <img
            src={URL.createObjectURL(file)}
            alt="uploaded"
            width={100}
            height={100}
          />
        )}
      </div>
      <button onClick={handleImageUpload} disabled={!file}>
        Upload
      </button>
    </>
  );
};

export default ImageUploader;
