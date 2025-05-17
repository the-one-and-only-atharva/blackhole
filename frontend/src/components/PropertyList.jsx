import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropertyForm from "./PropertyForm";
import backgroundImage from "../assets/new-york-5185104.jpg";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      when: "beforeChildren",
      staggerChildren: 0.4,
      delayChildren: 0.5,
      ease: "easeIn",
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 2,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

const textVariants = {
  hidden: {
    opacity: 0,
    x: -10,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const hoverVariants = {
  hover: {
    scale: 1.02,
    transition: {
      type: "spring",
      bounce: 0.6,
      duration: 0.3,
    },
  },
};

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

  const handlePropertyCreated = () => {
    // Refresh the properties list
    const token = localStorage.getItem("token");
    fetch("http://localhost:8000/properties", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setProperties(data))
      .catch((error) => {
        console.error("Error refreshing properties:", error);
      });
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen py-8 relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {error ? (
          <motion.div
            variants={itemVariants}
            className="bg-[#1a1a1a]/80 backdrop-blur-md p-8 rounded-xl border border-red-800"
          >
            <motion.h3
              variants={itemVariants}
              className="text-xl font-semibold text-red-400 mb-2"
            >
              Error
            </motion.h3>
            <motion.p variants={itemVariants} className="text-red-300 mb-4">
              {error}
            </motion.p>
            <motion.button
              whileHover={{
                scale: 1.02,
                transition: {
                  duration: 0.2,
                  ease: "easeIn",
                },
              }}
              whileTap={{
                scale: 0.98,
                transition: {
                  duration: 0.1,
                  ease: "easeIn",
                },
              }}
              onClick={() => window.location.reload()}
              className="relative group bg-transparent border-2 border-red-400 text-red-400 py-2 px-4 rounded-md text-sm font-medium overflow-hidden"
            >
              <span className="relative z-10">Retry</span>
              <motion.div
                className="absolute inset-0 bg-red-400"
                initial={{ scaleX: 0 }}
                whileHover={{
                  scaleX: 1,
                  transition: {
                    duration: 0.2,
                    ease: "easeIn",
                  },
                }}
                style={{ originX: 0 }}
              />
            </motion.button>
          </motion.div>
        ) : (
          <>
            <motion.div
              variants={itemVariants}
              className="flex justify-between items-center mb-8"
            >
              <div>
                <motion.h2
                  variants={itemVariants}
                  className="text-3xl font-bold text-white"
                >
                  Available Properties
                </motion.h2>
                <motion.div
                  variants={itemVariants}
                  className="text-sm text-gray-300 mt-1"
                >
                  {properties.length}{" "}
                  {properties.length === 1 ? "property" : "properties"} found
                </motion.div>
              </div>
              <PropertyForm onCreated={handlePropertyCreated} />
            </motion.div>

            <AnimatePresence mode="wait">
              {properties.length === 0 ? (
                <motion.div
                  variants={itemVariants}
                  className="bg-[#1a1a1a]/80 backdrop-blur-md p-8 rounded-xl border border-gray-800 text-center"
                >
                  <p className="text-gray-300">No properties found</p>
                </motion.div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  className="grid grid-cols-1 gap-4"
                >
                  {properties.map((property) => (
                    <motion.div
                      key={property.id}
                      variants={itemVariants}
                      whileHover={{
                        scale: 1.01,
                        transition: {
                          duration: 0.2,
                          ease: "easeIn",
                        },
                      }}
                      onClick={() => handlePropertyClick(property.id)}
                      className="group bg-[#1a1a1a]/80 backdrop-blur-md p-6 rounded-xl border border-gray-800 cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <motion.h3
                            variants={itemVariants}
                            whileHover={{
                              color: "#22d3ee",
                              transition: {
                                duration: 0.2,
                                ease: "easeIn",
                              },
                            }}
                            className="text-xl font-semibold text-white mb-2"
                          >
                            {property.location}
                          </motion.h3>
                          <motion.div
                            variants={itemVariants}
                            className="space-y-1"
                          >
                            <p className="text-gray-400">
                              <span className="text-cyan-400">Intent:</span>{" "}
                              <span className="text-gray-300">
                                {property.buyer_intent}
                              </span>
                            </p>
                            <p className="text-gray-400">
                              <span className="text-cyan-400">Status:</span>{" "}
                              <span className="text-gray-300">
                                {property.verification}
                              </span>
                            </p>
                          </motion.div>
                        </div>
                        <motion.div
                          variants={itemVariants}
                          whileHover={{
                            opacity: 1,
                            transition: {
                              duration: 0.2,
                              ease: "easeIn",
                            },
                          }}
                          initial={{ opacity: 0 }}
                          className="opacity-0 group-hover:opacity-100"
                        >
                          <svg
                            className="w-6 h-6 text-cyan-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
}
