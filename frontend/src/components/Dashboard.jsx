import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropertyForm from "./PropertyForm";
import mexicoBg from "../assets/mexico-7596566.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProperties } from "../api";

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({
    intent: "",
    location: "",
    verification: "",
  });
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fetch properties with filters
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        const data = await fetchProperties(filters);
        setProperties(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProperties();
  }, [filters]);

  // Calculate stats
  const stats = {
    total: properties.length,
    verified: properties.filter((p) => p.verification === "verified").length,
    pending: properties.filter((p) => p.verification === "pending").length,
    recent: properties
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 5)
      .map((p) => ({
        action: p.verification === "verified" ? "Verified" : "Updated",
        location: p.location,
        time: new Date(p.updated_at).toLocaleDateString(),
      })),
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const sortedProperties = [...properties].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    const modifier = sortOrder === "asc" ? 1 : -1;
    return aValue > bValue ? modifier : -modifier;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-10 px-4 relative"
      style={{
        backgroundImage: `url(${mexicoBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Frosted glass overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <motion.div
        className="max-w-4xl mx-auto relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Welcome and Add Property */}
        <motion.div
          className="flex justify-between items-center mb-8"
          variants={itemVariants}
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome{user?.name ? `, ${user.name}` : "!"}
            </h1>
            <p className="text-gray-200">
              Here's a quick overview of your property management activity.
            </p>
          </div>
          <PropertyForm
            onCreated={() => {
              // Refresh properties after creation
              fetchProperties(filters).then(setProperties);
            }}
          />
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          variants={containerVariants}
        >
          <motion.div
            className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-6 text-center"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-2xl font-bold text-cyan-400">
              {stats.total}
            </div>
            <div className="text-gray-200 mt-1">Total Properties</div>
          </motion.div>
          <motion.div
            className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-6 text-center"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-2xl font-bold text-cyan-400">
              {stats.verified}
            </div>
            <div className="text-gray-200 mt-1">Verified</div>
          </motion.div>
          <motion.div
            className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-6 text-center"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-2xl font-bold text-cyan-400">
              {stats.pending}
            </div>
            <div className="text-gray-200 mt-1">Pending</div>
          </motion.div>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-6 mb-8"
          variants={itemVariants}
        >
          <h2 className="text-xl font-bold text-white mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              name="intent"
              value={filters.intent}
              onChange={handleFilterChange}
              className="bg-black/40 text-white border border-white/10 rounded-md px-3 py-2"
            >
              <option value="">All Intents</option>
              <option value="buy">Buy</option>
              <option value="rent">Rent</option>
              <option value="sell">Sell</option>
            </select>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Filter by location"
              className="bg-black/40 text-white border border-white/10 rounded-md px-3 py-2"
            />
            <select
              name="verification"
              value={filters.verification}
              onChange={handleFilterChange}
              className="bg-black/40 text-white border border-white/10 rounded-md px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </motion.div>

        {/* Property List */}
        <motion.div
          className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-6 mb-8"
          variants={itemVariants}
        >
          <h2 className="text-xl font-bold text-white mb-4">Properties</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-300">
                  <th
                    className="p-2 cursor-pointer hover:text-cyan-400"
                    onClick={() => handleSort("location")}
                  >
                    Location{" "}
                    {sortBy === "location" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="p-2 cursor-pointer hover:text-cyan-400"
                    onClick={() => handleSort("buyer_intent")}
                  >
                    Intent{" "}
                    {sortBy === "buyer_intent" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="p-2 cursor-pointer hover:text-cyan-400"
                    onClick={() => handleSort("verification")}
                  >
                    Status{" "}
                    {sortBy === "verification" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="p-2 cursor-pointer hover:text-cyan-400"
                    onClick={() => handleSort("updated_at")}
                  >
                    Last Updated{" "}
                    {sortBy === "updated_at" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {sortedProperties.map((property) => (
                  <motion.tr
                    key={property.id}
                    className="hover:bg-white/5 cursor-pointer"
                    onClick={() => navigate(`/properties/${property.id}`)}
                    whileHover={{ x: 10 }}
                  >
                    <td className="p-2 text-gray-200">{property.location}</td>
                    <td className="p-2 text-gray-200">
                      {property.buyer_intent}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          property.verification === "verified"
                            ? "bg-green-900 text-green-300"
                            : "bg-yellow-900 text-yellow-300"
                        }`}
                      >
                        {property.verification}
                      </span>
                    </td>
                    <td className="p-2 text-gray-300 text-sm">
                      {new Date(property.updated_at).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-6"
          variants={itemVariants}
        >
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <AnimatePresence mode="wait">
            {stats.recent.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-gray-200"
              >
                No recent activity.
              </motion.p>
            ) : (
              <motion.ul
                className="divide-y divide-white/10"
                variants={containerVariants}
              >
                {stats.recent.map((item, idx) => (
                  <motion.li
                    key={idx}
                    className="py-2 flex justify-between items-center"
                    variants={itemVariants}
                    whileHover={{ x: 10 }}
                  >
                    <span className="text-cyan-400 font-medium">
                      {item.action}
                    </span>
                    <span className="text-gray-200">{item.location}</span>
                    <span className="text-gray-300 text-sm">{item.time}</span>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
