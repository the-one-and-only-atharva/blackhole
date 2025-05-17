import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:8000/properties", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setProperties(data))
      .catch((error) => {
        console.error("Error fetching properties:", error);
        setError("Failed to load properties");
      });
  }, [navigate]);

  const handlePropertyClick = (propertyId) => {
    navigate(`/properties/${propertyId}`);
  };

  if (error) {
    return (
      <div className="mt-8 p-8 bg-red-50 rounded-lg text-red-600">
        <h3 className="text-xl font-semibold mb-2">Error</h3>
        <p className="mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6">Available Properties</h2>
      {properties.length === 0 ? (
        <p className="text-center text-gray-600">No properties found</p>
      ) : (
        <ul className="space-y-4">
          {properties.map((property) => (
            <li
              key={property.id}
              onClick={() => handlePropertyClick(property.id)}
              className="bg-gray-50 p-6 rounded-lg cursor-pointer hover:shadow-md transition duration-200"
            >
              <h3 className="text-xl font-semibold mb-2">
                {property.location}
              </h3>
              <p className="text-gray-600 mb-2">
                Intent: {property.buyer_intent}
              </p>
              <p className="text-gray-600">Status: {property.verification}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
