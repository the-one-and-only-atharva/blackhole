import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import bgImage from "../assets/architecture-1868667.jpg";
import sha256 from "crypto-js/sha256";
import { getProperty, updateProperty, deleteProperty } from "../api";

function renderChanges(changes) {
  if (!changes || typeof changes !== "object") return null;
  const entries = Object.entries(changes);
  return (
    <div className="mt-2">
      <table className="min-w-full text-sm text-left">
        <tbody>
          {entries.map(([key, value]) => {
            if (key === "owner" && value && typeof value === "object") {
              return (
                <tr key={key}>
                  <td className="pr-2 font-medium text-cyan-400 align-top">
                    Owner
                  </td>
                  <td className="align-top">
                    <div className="mb-1">
                      <span className="font-semibold text-gray-300">Name:</span>{" "}
                      <span className="text-gray-400">{value.name}</span>
                    </div>
                    <div className="mb-1">
                      <span className="font-semibold text-gray-300">
                        Email:
                      </span>{" "}
                      <span className="text-gray-400">{value.email}</span>
                    </div>
                  </td>
                </tr>
              );
            }
            if (["password", "id", "_id"].includes(key)) return null;
            return (
              <tr key={key}>
                <td className="pr-2 font-medium text-cyan-400 align-top">
                  {key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </td>
                <td className="align-top text-gray-400">{String(value)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function hashPropertyData(changes, prev_hash = null) {
  // Mimic backend: sorted entries, include prev_hash if present
  const data = { ...changes };
  if (prev_hash) data["prev_hash"] = prev_hash;
  // Sort keys for deterministic stringification
  const sortedEntries = Object.entries(data).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const dataStr = JSON.stringify(sortedEntries);
  return sha256(dataStr).toString();
}

function verifyChainLinkage(logs) {
  for (let i = 1; i < logs.length; i++) {
    if (logs[i].prev_hash !== logs[i - 1].hash) {
      return false;
    }
  }
  return true;
}

function verifyFullChain(logs) {
  for (let i = 0; i < logs.length; i++) {
    const prev_hash = i === 0 ? null : logs[i].prev_hash;
    const recomputedHash = hashPropertyData(logs[i].changes, prev_hash);
    if (logs[i].hash !== recomputedHash) {
      return false;
    }
    if (i > 0 && logs[i].prev_hash !== logs[i - 1].hash) {
      return false;
    }
  }
  return true;
}

export default function PropertyDetails() {
  const [property, setProperty] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [chainValid, setChainValid] = useState(null);
  const [fullChainValid, setFullChainValid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProperty, setEditedProperty] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        setLoading(true);
        setError(null);
        const propertyData = await getProperty(id);
        setProperty(propertyData);
        setEditedProperty(propertyData);
        const auditRes = await fetch(
          `http://localhost:8000/properties/${id}/audit`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!auditRes.ok) {
          throw new Error("Failed to fetch audit logs");
        }
        const auditData = await auditRes.json();
        setAuditLogs(auditData);
        setChainValid(verifyChainLinkage(auditData));
        setFullChainValid(verifyFullChain(auditData));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProperty(property);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Match the backend Property model exactly
      const updateData = {
        id: property.id,
        owner: {
          id: property.owner?.id || null,
          name: editedProperty.owner?.name || property.owner?.name || "",
          email: editedProperty.owner?.email || property.owner?.email || "",
        },
        buyer_intent:
          editedProperty.buyer_intent || property.buyer_intent || "",
        location: editedProperty.location || property.location || "",
        verification:
          editedProperty.verification || property.verification || "",
        terms: editedProperty.terms || property.terms || "",
        created_at: property.created_at,
        updated_at: new Date().toISOString(),
      };
      const updatedProperty = await updateProperty(id, updateData);
      setProperty(updatedProperty);
      setIsEditing(false);
      // Refresh audit logs
      const auditRes = await fetch(
        `http://localhost:8000/properties/${id}/audit`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      const auditData = await auditRes.json();
      setAuditLogs(auditData);
      setChainValid(verifyChainLinkage(auditData));
      setFullChainValid(verifyFullChain(auditData));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this property?")) {
      return;
    }
    try {
      setIsDeleting(true);
      await deleteProperty(id);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
      setIsDeleting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProperty((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen relative"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div className="relative max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-[#1a1a1a] p-8 rounded-xl border border-gray-800"
          >
            <p className="text-center text-gray-400">Loading...</p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen relative"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div className="relative max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-[#1a1a1a] p-8 rounded-xl border border-red-800"
          >
            <h3 className="text-xl font-semibold text-red-400 mb-2">Error</h3>
            <p className="text-red-300 mb-4">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="relative group bg-transparent border-2 border-red-400 text-red-400 py-2 px-4 rounded-md text-sm font-medium overflow-hidden transition-all duration-300 hover:bg-red-400 hover:text-black cursor-pointer"
            >
              <span className="relative z-10">Retry</span>
              <div className="absolute inset-0 bg-red-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (!property) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen relative"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div className="relative max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-[#1a1a1a] p-8 rounded-xl border border-gray-800"
          >
            <p className="text-center text-gray-400">Property not found</p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      <div className="relative max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#1a1a1a]/80 backdrop-blur-md p-8 rounded-xl border border-gray-800/50 mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-3xl font-bold text-white"
            >
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={editedProperty.location}
                  onChange={handleInputChange}
                  className="bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 w-full"
                />
              ) : (
                property.location
              )}
            </motion.h1>
            <div className="space-x-2">
              {isEditing ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    className="bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium"
                    disabled={loading}
                  >
                    Save
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancel}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm font-medium"
                    disabled={loading}
                  >
                    Cancel
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEdit}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium"
                    disabled={loading}
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDelete}
                    className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium"
                    disabled={loading || isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </motion.button>
                </>
              )}
            </div>
          </div>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-6"
          >
            <div
              className={`inline-flex items-center px-4 py-2 rounded-full ${
                property.verification === "verified"
                  ? "bg-green-900/50 text-green-400 border border-green-500/50"
                  : property.verification === "pending"
                  ? "bg-yellow-900/50 text-yellow-400 border border-yellow-500/50"
                  : "bg-red-900/50 text-red-400 border border-red-500/50"
              }`}
            >
              <span className="text-sm font-medium">
                {property.verification === "verified"
                  ? "✓ Verified"
                  : property.verification === "pending"
                  ? "⏳ Pending Verification"
                  : "⚠️ Unverified"}
              </span>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="mb-4">
                <span className="text-sm font-medium text-cyan-400">
                  Intent
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    name="buyer_intent"
                    value={editedProperty.buyer_intent}
                    onChange={handleInputChange}
                    className="mt-1 w-full bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-lg text-gray-300">
                    {property.buyer_intent}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <span className="text-sm font-medium text-cyan-400">
                  Status
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    name="verification"
                    value={editedProperty.verification}
                    onChange={handleInputChange}
                    className="mt-1 w-full bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-lg text-gray-300">
                    {property.verification}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <span className="text-sm font-medium text-cyan-400">Terms</span>
                {isEditing ? (
                  <textarea
                    name="terms"
                    value={editedProperty.terms}
                    onChange={handleInputChange}
                    rows="3"
                    className="mt-1 w-full bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-lg text-gray-300">{property.terms}</p>
                )}
              </div>
            </motion.div>
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="mb-4">
                <span className="text-sm font-medium text-cyan-400">Owner</span>
                <div className="mt-1">
                  <p className="text-lg text-gray-300">
                    {property.owner?.name || "No owner"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {property.owner?.email || "No email"}
                  </p>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-sm font-medium text-cyan-400">
                  Created
                </span>
                <p className="mt-1 text-lg text-gray-300">
                  {new Date(property.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="mb-4">
                <span className="text-sm font-medium text-cyan-400">
                  Last Updated
                </span>
                <p className="mt-1 text-lg text-gray-300">
                  {new Date(property.updated_at).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-[#1a1a1a]/80 backdrop-blur-md p-8 rounded-xl border border-gray-800/50"
        >
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="text-2xl font-bold text-white mb-6"
          >
            Audit Log
          </motion.h2>
          <div className="mb-4 flex flex-col md:flex-row items-start md:items-center gap-4">
            <button
              onClick={() => setChainValid(verifyChainLinkage(auditLogs))}
              className="bg-cyan-900 text-cyan-300 px-4 py-2 rounded hover:bg-cyan-800 transition cursor-pointer"
            >
              Verify Chain Linkage
            </button>
            {chainValid === true && (
              <span className="text-green-400 font-semibold">
                Chain linkage is valid
              </span>
            )}
            {chainValid === false && (
              <span className="text-red-400 font-semibold">
                Chain linkage is broken!
              </span>
            )}
            <button
              onClick={() => setFullChainValid(verifyFullChain(auditLogs))}
              className="bg-green-900 text-green-300 px-4 py-2 rounded hover:bg-green-800 transition cursor-pointer"
            >
              Verify Full Chain Integrity
            </button>
            {fullChainValid === true && (
              <span className="text-green-400 font-semibold">
                Full chain is cryptographically valid
              </span>
            )}
            {fullChainValid === false && (
              <span className="text-red-400 font-semibold">
                Full chain integrity is broken!
              </span>
            )}
          </div>
          <AnimatePresence mode="wait">
            {auditLogs.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-gray-400"
              >
                No audit logs found
              </motion.p>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                className="space-y-4"
              >
                {auditLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2 },
                    }}
                    className={`border rounded-lg p-4 hover:bg-[#0a0a0a] transition-colors duration-200 ${
                      log.fraud_detected
                        ? "border-red-500/50 bg-red-900/20"
                        : "border-gray-800"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2"
                      >
                        <span
                          className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                            log.fraud_detected
                              ? "bg-red-900 text-red-400"
                              : "bg-cyan-900 text-cyan-400"
                          }`}
                        >
                          {log.action}
                        </span>
                        {log.fraud_detected && (
                          <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-red-900 text-red-400">
                            Fraud Detected
                          </span>
                        )}
                      </motion.div>
                      <span className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {log.fraud_detected && (
                      <div className="mb-2 p-2 bg-red-900/30 rounded-md border border-red-500/30">
                        <p className="text-sm text-red-400">
                          <span className="font-semibold">Reason:</span>{" "}
                          {log.fraud_reason}
                        </p>
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      <div>
                        <span className="font-semibold text-cyan-400">
                          Hash:
                        </span>{" "}
                        {log.hash}
                      </div>
                      <div>
                        <span className="font-semibold text-cyan-400">
                          Prev Hash:
                        </span>{" "}
                        {log.prev_hash || "None"}
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">
                        <span className="font-medium text-gray-300">User:</span>{" "}
                        {log.user?.name || log.user?.email || "Unknown"}
                      </p>
                      {log.changes && Object.keys(log.changes).length > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="mt-2"
                        >
                          <p className="text-sm font-medium text-gray-300 mb-1">
                            Changes:
                          </p>
                          {renderChanges(log.changes)}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
