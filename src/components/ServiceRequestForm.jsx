"use client";
import { useEffect, useRef, useState } from "react";
import { captureAttribution, getAttribution, pushLeadEvent } from "@/lib/attribution";

const SERVICE_OPTIONS = [
  ["Auto Repair", "Auto Repair"],
  ["Diesel Repair", "Diesel Repair"],
  ["Diagnostics", "Diagnostics"],
  ["Maintenance", "Maintenance"],
  ["Fleet Services", "Fleet Services"],
  ["SSC", "Safety Standards Certificate (SSC)"],
];

// Funnel events for GTM/GA4 so drop-off between steps is measurable.
function pushFunnelEvent(event, extra = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, form: "quote_request", ...extra });
}

const ServiceRequestForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "Maintenance",
    date: new Date().toISOString().split("T")[0],
    time: "",
    message: "",
  });
  const [vehicle, setVehicle] = useState({
    year: "", make: "", makeId: "",
    model: "", modelId: "",
    submodel: "", submodelId: "",
    licensePlate: "",
  });
  // Catalog search: unified VIN / year-make-model search like Shopmonkey's form.
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null); // full catalog record
  const [manualEntry, setManualEntry] = useState(false);
  const [vehicleOpts, setVehicleOpts] = useState({ years: [], makes: [], models: [], submodels: [] });
  const [vehicleLoading, setVehicleLoading] = useState({});
  const [vehicleLookupFailed, setVehicleLookupFailed] = useState(false);
  const [skipVehicle, setSkipVehicle] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const leadSentRef = useRef(false);

  useEffect(() => {
    captureAttribution();
    pushFunnelEvent("request_form_view");
    fetchVehicleOpts("years");
  }, []);

  // If a visitor typed name+email but closes/abandons the page before
  // finishing the form, still capture the lead into the CRM via sendBeacon
  // (survives page unload, unlike fetch).
  useEffect(() => {
    const captureAbandon = () => {
      if (leadSentRef.current) return;
      const name = formData.name.trim();
      const email = formData.email.trim();
      if (!name || !/\S+@\S+\.\S+/.test(email)) return;
      leadSentRef.current = true;
      const payload = JSON.stringify({
        stage: "lead",
        name,
        email,
        phone: formData.phone,
        attribution: getAttribution(),
        timestamp: new Date().toISOString(),
        type: "quote_request_lead",
      });
      navigator.sendBeacon?.("/api/contact/", new Blob([payload], { type: "application/json" }));
      pushFunnelEvent("request_form_abandon_capture");
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") captureAbandon();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", captureAbandon);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", captureAbandon);
    };
  }, [formData.name, formData.email, formData.phone]);

  // Debounced unified vehicle search (VIN auto-detects at 17 chars).
  useEffect(() => {
    const q = vehicleSearch.trim();
    if (q.length < 3 || selectedVehicle) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/vehicle/?type=search&term=${encodeURIComponent(q)}`);
        const json = await res.json().catch(() => null);
        if (res.ok && json?.success) setSearchResults(json.data || []);
        else setSearchResults([]);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [vehicleSearch, selectedVehicle]);

  const today = new Date().toISOString().split("T")[0];

  const timeSlots = [];
  for (let hour = 8; hour <= 18; hour++) {
    for (let min = 0; min < 60; min += 30) {
      timeSlots.push(`${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`);
    }
  }

  // --- Shopmonkey vehicle catalog (proxied via /api/vehicle) ---
  async function fetchVehicleOpts(type, params = {}) {
    setVehicleLoading((prev) => ({ ...prev, [type]: true }));
    try {
      const qs = new URLSearchParams({ type, ...params }).toString();
      const res = await fetch(`/api/vehicle/?${qs}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error("lookup failed");
      setVehicleOpts((prev) => ({ ...prev, [type === "years" ? "years" : type]: json.data }));
      return json.data;
    } catch {
      // Graceful degradation: fall back to free-text vehicle inputs.
      setVehicleLookupFailed(true);
      return [];
    } finally {
      setVehicleLoading((prev) => ({ ...prev, [type]: false }));
    }
  }

  const handleVehicleChange = async (e) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "year") {
      setVehicle((prev) => ({ ...prev, year: value, make: "", makeId: "", model: "", modelId: "", submodel: "", submodelId: "" }));
      setVehicleOpts((prev) => ({ ...prev, makes: [], models: [], submodels: [] }));
      if (value) await fetchVehicleOpts("makes", { year: value });
    } else if (name === "makeId") {
      const opt = vehicleOpts.makes.find((m) => String(m.makeId) === value);
      setVehicle((prev) => ({ ...prev, make: opt?.make || "", makeId: value, model: "", modelId: "", submodel: "", submodelId: "" }));
      setVehicleOpts((prev) => ({ ...prev, models: [], submodels: [] }));
      if (value) await fetchVehicleOpts("models", { year: vehicle.year, makeId: value });
    } else if (name === "modelId") {
      const opt = vehicleOpts.models.find((m) => String(m.modelId) === value);
      setVehicle((prev) => ({ ...prev, model: opt?.model || "", modelId: value, submodel: "", submodelId: "" }));
      setVehicleOpts((prev) => ({ ...prev, submodels: [] }));
      if (value) await fetchVehicleOpts("submodels", { year: vehicle.year, makeId: vehicle.makeId, modelId: value });
    } else if (name === "submodelId") {
      const opt = vehicleOpts.submodels.find((m) => String(m.submodelId) === value);
      setVehicle((prev) => ({ ...prev, submodel: opt?.submodel || "", submodelId: value }));
    } else {
      setVehicle((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Pick a vehicle from catalog search results — captures the full
  // configured record (YMM + ids + engine + size + VIN).
  const selectSearchResult = (v) => {
    setSelectedVehicle(v);
    setVehicle((prev) => ({
      ...prev,
      year: v.year ? String(v.year) : "",
      make: v.make || "",
      makeId: v.makeId ? String(v.makeId) : "",
      model: v.model || "",
      modelId: v.modelId ? String(v.modelId) : "",
      submodel: v.submodel || "",
      submodelId: v.submodelId ? String(v.submodelId) : "",
    }));
    setVehicleSearch("");
    setSearchResults([]);
    setErrors((prev) => ({ ...prev, year: "", makeId: "", modelId: "", make: "", vehicle: "" }));
  };

  const clearSelectedVehicle = () => {
    setSelectedVehicle(null);
    setVehicle((prev) => ({ ...prev, year: "", make: "", makeId: "", model: "", modelId: "", submodel: "", submodelId: "" }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (formData.service === "Choose") newErrors.service = "Please select a service";
    if (!skipVehicle) {
      if (manualEntry) {
        if (!vehicle.year) newErrors.year = "Select the year";
        if (!vehicle.makeId) newErrors.makeId = "Select the make";
        if (!vehicle.modelId) newErrors.modelId = "Select the model";
      } else if (!selectedVehicle) {
        newErrors.vehicle = "Search and select your vehicle, or check “I’m not sure”";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 1 -> Step 2. The partial lead is pushed to Shopmonkey + emailed to
  // the shop here so abandoning at step 2 still leaves a usable lead. Even
  // if this call fails we proceed — the final submit re-sends everything.
  const handleContinue = async () => {
    if (!validateStep1()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: "lead",
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          attribution: getAttribution(),
          timestamp: new Date().toISOString(),
          type: "quote_request_lead",
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) leadSentRef.current = true;
    } catch {
      // proceed anyway — the abandon beacon retries if this failed
    } finally {
      setIsSubmitting(false);
      setStep(2);
      pushFunnelEvent("request_form_step2");
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setIsSubmitting(true);
    setSubmitStatus("");
    try {
      const mergedVehicle = skipVehicle
        ? {}
        : {
            ...(selectedVehicle || {}),
            ...Object.fromEntries(Object.entries(vehicle).filter(([, v]) => v !== "")),
          };
      const vehiclePayload = Object.fromEntries(
        Object.entries(mergedVehicle).filter(([, v]) => v !== "" && v !== null && v !== undefined)
      );
      const res = await fetch("/api/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          stage: "complete",
          vehicle: vehiclePayload,
          attribution: getAttribution(),
          timestamp: new Date().toISOString(),
          type: "quote_request",
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setSubmitStatus("success");
        leadSentRef.current = true;
        pushLeadEvent({ email: formData.email, phone: formData.phone });
        pushFunnelEvent("request_form_submit");
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === "success") {
    return (
      <div className="text-center py-5">
        <div style={{ fontSize: 56, color: "var(--theme-color)" }}>
          <i className="fas fa-check-circle" />
        </div>
        <h3 className="mt-3">Request received!</h3>
        <p className="mb-1">
          Thanks {formData.name.split(" ")[0]}, we&apos;ve got your details and will confirm shortly.
        </p>
        <p className="text-muted">
          Need it sooner? Call us at <a href="tel:+14378364848">(437) 836-4848</a>.
        </p>
      </div>
    );
  }

  const progressPct = step === 1 ? 50 : 100;

  return (
    <form
      className="appointment-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (step === 1) handleContinue();
        else handleSubmit();
      }}
    >
      {/* Progress indicator */}
      <div className="mb-4">
        <div className="d-flex justify-content-between mb-2">
          <span className={step === 1 ? "fw-bold" : "text-muted"}>
            <i className={`fas ${step > 1 ? "fa-check-circle text-success" : "fa-user"} me-1`} />
            1. Your details
          </span>
          <span className={step === 2 ? "fw-bold" : "text-muted"}>
            <i className="fas fa-car me-1" />
            2. Vehicle &amp; service
          </span>
        </div>
        <div className="progress" style={{ height: 6 }}>
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${progressPct}%`, backgroundColor: "var(--theme-color)", transition: "width .3s" }}
            aria-valuenow={progressPct}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
      </div>

      {step === 1 && (
        <>
          <p className="mb-4">Takes 30 seconds. We&apos;ll follow up to confirm.</p>
          <div className="row">
            <div className="col-12">
              <div className="form-group">
                <input
                  type="text"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  name="name"
                  id="srq-name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your Name"
                  autoComplete="name"
                  autoFocus
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>
            </div>
            <div className="col-12">
              <div className="form-group">
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  name="email"
                  id="srq-email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  autoComplete="email"
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
            </div>
            <div className="col-12">
              <div className="form-group">
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  id="srq-phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone Number (optional)"
                  autoComplete="tel"
                />
              </div>
            </div>
          </div>
          <div className="form-btn col-12">
            <button type="submit" className="btn style2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Please wait...
                </>
              ) : (
                <>
                  Continue <i className="fas fa-arrow-right ms-2" />
                </>
              )}
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          {/* Vehicle */}
          <div className="row align-items-center mb-2">
            <div className="col">
              <h5 className="mb-0">Your vehicle</h5>
            </div>
            <div className="col-auto">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="srq-skip-vehicle"
                  checked={skipVehicle}
                  onChange={(e) => {
                    setSkipVehicle(e.target.checked);
                    if (e.target.checked) setErrors((prev) => ({ ...prev, year: "", makeId: "", modelId: "", make: "", vehicle: "" }));
                  }}
                />
                <label className="form-check-label" htmlFor="srq-skip-vehicle">
                  I&apos;m not sure, we&apos;ll discuss it
                </label>
              </div>
            </div>
          </div>

          {!skipVehicle && !manualEntry && !selectedVehicle && (
            <div className="form-group position-relative">
              <div className="input-group">
                <span className="input-group-text"><i className="fas fa-search" /></span>
                <input
                  type="text"
                  className={`form-control ${errors.vehicle ? "is-invalid" : ""}`}
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  placeholder="Search by VIN or year/make/model (e.g. 2019 Civic)"
                  autoComplete="off"
                />
                {vehicleSearch && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => { setVehicleSearch(""); setSearchResults([]); }}
                    aria-label="Clear search"
                  >
                    <i className="fas fa-times" />
                  </button>
                )}
              </div>
              {errors.vehicle && <div className="invalid-feedback d-block">{errors.vehicle}</div>}

              {searching && (
                <div className="text-muted small mt-1">
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                  Searching vehicles…
                </div>
              )}

              {searchResults.length > 0 && (
                <ul
                  className="list-group mt-1"
                  style={{ maxHeight: 280, overflowY: "auto" }}
                >
                  {searchResults.slice(0, 10).map((v, i) => (
                    <li
                      key={`${v.vcdbVehicleId || v.baseId || i}-${v.submodelId || i}`}
                      className="list-group-item list-group-item-action"
                      style={{ cursor: "pointer" }}
                      onClick={() => selectSearchResult(v)}
                    >
                      <div className="fw-bold">
                        {[v.year, v.make, v.model, v.submodel].filter(Boolean).join(" ")}
                      </div>
                      {v.engine && <div className="text-muted small">{v.engine}</div>}
                    </li>
                  ))}
                </ul>
              )}

              {!searching && vehicleSearch.trim().length >= 3 && searchResults.length === 0 && (
                <div className="text-muted small mt-1">
                  No matches. Try a VIN, or{" "}
                  <a href="#manual" onClick={(e) => { e.preventDefault(); setManualEntry(true); }}>enter it manually</a>.
                </div>
              )}
            </div>
          )}

          {!skipVehicle && !manualEntry && selectedVehicle && (
            <div className="border rounded p-3 mb-3 d-flex align-items-start gap-2">
              <i className="fas fa-car mt-1" style={{ color: "var(--theme-color)" }} />
              <div className="flex-grow-1">
                <div className="fw-bold">
                  {[selectedVehicle.year, selectedVehicle.make, selectedVehicle.model, selectedVehicle.submodel].filter(Boolean).join(" ")}
                </div>
                {selectedVehicle.engine && <div className="text-muted small">{selectedVehicle.engine}</div>}
                {selectedVehicle.vin && <div className="text-muted small">VIN: {selectedVehicle.vin}</div>}
              </div>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={clearSelectedVehicle}>
                Change
              </button>
            </div>
          )}

          {!skipVehicle && (
            <div className="mb-2">
              <a
                href="#toggle-manual"
                className="small"
                onClick={(e) => {
                  e.preventDefault();
                  setManualEntry((v) => !v);
                  setErrors((prev) => ({ ...prev, vehicle: "", year: "", makeId: "", modelId: "", make: "" }));
                }}
              >
                {manualEntry ? "Search by VIN / year / make / model instead" : "Enter vehicle manually"}
              </a>
            </div>
          )}

          {!skipVehicle && manualEntry && !vehicleLookupFailed && (
            <div className="row">
              <div className="col-md-4">
                <div className="form-group">
                  <select
                    name="year"
                    id="srq-year"
                    className={`form-select ${errors.year ? "is-invalid" : ""}`}
                    value={vehicle.year}
                    onChange={handleVehicleChange}
                  >
                    <option value="">Year{vehicleLoading.years ? " (loading…)" : ""}</option>
                    {vehicleOpts.years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  {errors.year && <div className="invalid-feedback">{errors.year}</div>}
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <select
                    name="makeId"
                    id="srq-make"
                    className={`form-select ${errors.makeId ? "is-invalid" : ""}`}
                    value={vehicle.makeId}
                    onChange={handleVehicleChange}
                    disabled={!vehicle.year}
                  >
                    <option value="">{vehicleLoading.makes ? "Loading makes…" : "Make"}</option>
                    {vehicleOpts.makes.map((m) => (
                      <option key={m.makeId} value={m.makeId}>{m.make}</option>
                    ))}
                  </select>
                  {errors.makeId && <div className="invalid-feedback">{errors.makeId}</div>}
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <select
                    name="modelId"
                    id="srq-model"
                    className={`form-select ${errors.modelId ? "is-invalid" : ""}`}
                    value={vehicle.modelId}
                    onChange={handleVehicleChange}
                    disabled={!vehicle.makeId}
                  >
                    <option value="">{vehicleLoading.models ? "Loading models…" : "Model"}</option>
                    {vehicleOpts.models.map((m) => (
                      <option key={m.modelId} value={m.modelId}>{m.model}</option>
                    ))}
                  </select>
                  {errors.modelId && <div className="invalid-feedback">{errors.modelId}</div>}
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <select
                    name="submodelId"
                    id="srq-submodel"
                    className="form-select"
                    value={vehicle.submodelId}
                    onChange={handleVehicleChange}
                    disabled={!vehicle.modelId}
                  >
                    <option value="">{vehicleLoading.submodels ? "Loading trims…" : "Trim (optional)"}</option>
                    {vehicleOpts.submodels.map((m) => (
                      <option key={m.submodelId} value={m.submodelId}>{m.submodel}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    name="licensePlate"
                    id="srq-plate"
                    value={vehicle.licensePlate}
                    onChange={handleVehicleChange}
                    placeholder="License plate (optional)"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>
          )}

          {!skipVehicle && manualEntry && vehicleLookupFailed && (
            <div className="row">
              <div className="col-md-4">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    name="year"
                    value={vehicle.year}
                    onChange={handleVehicleChange}
                    placeholder="Year (e.g. 2019)"
                    maxLength={4}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <input
                    type="text"
                    className={`form-control ${errors.make ? "is-invalid" : ""}`}
                    name="make"
                    value={vehicle.make}
                    onChange={handleVehicleChange}
                    placeholder="Make (e.g. Honda)"
                  />
                  {errors.make && <div className="invalid-feedback">{errors.make}</div>}
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    name="model"
                    value={vehicle.model}
                    onChange={handleVehicleChange}
                    placeholder="Model (e.g. Civic)"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    name="licensePlate"
                    value={vehicle.licensePlate}
                    onChange={handleVehicleChange}
                    placeholder="License plate (optional)"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>
          )}

          {!skipVehicle && !manualEntry && (
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    name="licensePlate"
                    id="srq-plate-search"
                    value={vehicle.licensePlate}
                    onChange={handleVehicleChange}
                    placeholder="License plate (optional)"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Service + scheduling */}
          <div className="row">
            <div className="col-12">
              <div className="form-group">
                <select
                  name="service"
                  id="srq-service"
                  className={`form-select ${errors.service ? "is-invalid" : ""}`}
                  value={formData.service}
                  onChange={handleInputChange}
                >
                  <option value="Choose">What service do you need?</option>
                  {SERVICE_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {errors.service && <div className="invalid-feedback">{errors.service}</div>}
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="srq-date" className="form-label">Preferred date (optional)</label>
                <input
                  type="date"
                  className="form-control"
                  name="date"
                  id="srq-date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={today}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="srq-time" className="form-label">Preferred time (optional)</label>
                <select
                  name="time"
                  id="srq-time"
                  className="form-select"
                  value={formData.time}
                  onChange={handleInputChange}
                >
                  <option value="">Any time works</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-12">
              <div className="form-group">
                <textarea
                  className="form-control"
                  name="message"
                  id="srq-message"
                  rows="3"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Anything else we should know? (optional)"
                />
              </div>
            </div>
          </div>

          <div className="form-btn col-12 d-flex gap-2 flex-wrap align-items-center">
            <button
              type="button"
              className="btn style2"
              style={{ background: "#6c757d" }}
              onClick={() => setStep(1)}
              disabled={isSubmitting}
            >
              <i className="fas fa-arrow-left me-2" /> Back
            </button>
            <button type="submit" className="btn style2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Sending...
                </>
              ) : (
                <>
                  Request Quote <i className="fas fa-arrow-right ms-2" />
                </>
              )}
            </button>
            <a href="tel:+14378364848" className="ms-auto text-decoration-none">
              <i className="fas fa-phone-alt me-1" /> (437) 836-4848
            </a>
          </div>

          {submitStatus === "error" && (
            <div className="alert alert-danger mt-3" role="alert">
              <i className="fas fa-exclamation-circle me-2" />
              <strong>Error!</strong> There was a problem submitting your request. Please try again or call us directly.
            </div>
          )}
        </>
      )}
    </form>
  );
};

export default ServiceRequestForm;
