import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function renderChanges(changes) {
  if (!changes || typeof changes !== "object") return null;
  const entries = Object.entries(changes);
  return (
    <div className="mt-2">
      <table className="min-w-full text-sm text-left">
        <tbody>
          {entries.map(([key, value]) => {
            if (key === "owner" && value && typeof value === "object") {
              // Render owner info, but hide password and id
              return (
                <tr key={key}>
                  <td className="pr-2 font-medium text-gray-700 align-top">
                    Owner
                  </td>
                  <td className="align-top">
                    <div className="mb-1">
                      <span className="font-semibold">Name:</span> {value.name}
                    </div>
                    <div className="mb-1">
                      <span className="font-semibold">Email:</span>{" "}
                      {value.email}
                    </div>
                  </td>
                </tr>
              );
            }
            if (["password", "id", "_id"].includes(key)) return null;
            // Render other fields
            return (
              <tr key={key}>
                <td className="pr-2 font-medium text-gray-700 align-top">
                  {key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </td>
                <td className="align-top">{String(value)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function PropertyDetails() {
  const [property, setProperty] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        const propertyRes = await fetch(
          `http://localhost:8000/properties/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!propertyRes.ok) {
          throw new Error("Failed to fetch property details");
        }
        const propertyData = await propertyRes.json();
        setProperty(propertyData);
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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white p-8 rounded-lg shadow">
            <p className="text-center text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 p-8 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white p-8 rounded-lg shadow">
            <p className="text-center text-gray-600">Property not found</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Property Details */}
        <div className="bg-white p-8 rounded-lg shadow mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {property.location}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500">
                  Intent
                </span>
                <p className="mt-1 text-lg text-gray-900">
                  {property.buyer_intent}
                </p>
              </div>
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500">
                  Status
                </span>
                <p className="mt-1 text-lg text-gray-900">
                  {property.verification}
                </p>
              </div>
            </div>
            <div>
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500">
                  Created
                </span>
                <p className="mt-1 text-lg text-gray-900">
                  {new Date(property.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500">
                  Last Updated
                </span>
                <p className="mt-1 text-lg text-gray-900">
                  {new Date(property.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Audit Logs */}
        <div className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Audit Log</h2>
          {auditLogs.length === 0 ? (
            <p className="text-center text-gray-600">No audit logs found</p>
          ) : (
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                        {log.action}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">User:</span>{" "}
                      {log.user?.name || log.user?.email || "Unknown"}
                    </p>
                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Changes:
                        </p>
                        {renderChanges(log.changes)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
