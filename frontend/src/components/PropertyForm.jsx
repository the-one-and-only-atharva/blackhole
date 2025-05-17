import React, { useState } from "react";
import { createProperty } from "../api";

export default function PropertyForm({ onCreated }) {
  const [form, setForm] = useState({
    owner: "",
    buyer_intent: "sale",
    location: "",
    verification: "pending",
    terms: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await createProperty(form);
    onCreated();
    setForm({
      owner: "",
      buyer_intent: "sale",
      location: "",
      verification: "pending",
      terms: "",
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
      <input
        name="owner"
        placeholder="Owner"
        value={form.owner}
        onChange={handleChange}
        required
      />
      <select
        name="buyer_intent"
        value={form.buyer_intent}
        onChange={handleChange}
      >
        <option value="sale">Sale</option>
        <option value="rent">Rent</option>
      </select>
      <input
        name="location"
        placeholder="Location"
        value={form.location}
        onChange={handleChange}
        required
      />
      <input
        name="verification"
        placeholder="Verification"
        value={form.verification}
        onChange={handleChange}
        required
      />
      <input
        name="terms"
        placeholder="Terms"
        value={form.terms}
        onChange={handleChange}
        required
      />
      <button type="submit">Add Property</button>
    </form>
  );
}
