import React, { useState, useEffect } from 'react';
import getUrl from '../urlconfig';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const url = getUrl();
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`${url}/api/images/public`);
        const data = await response.json();
        setImages(data);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="container">
      <h2 className="title is-2 has-text-centered">Image Gallery</h2>
      <div className="columns is-multiline">
        {images.map((image) => (
          <div key={image.id} className="column is-one-third">
            <div className="card">
              <div className="card-image">
                <figure className="image is-4by3">
                  <img src={`${url}/${image.url}`} alt={`Image ${image.id}`} />
                </figure>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
