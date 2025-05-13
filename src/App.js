import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

const App = () => {
  const [services, setServices] = useState([
    { id: 1, name: "GitHub API", url: "https://api.github.com" },
    { id: 2, name: "Google", url: "https://www.google.com" },
    { id: 3, name: "Local Service", url: "http://localhost:4000" },
    { id: 4, name: "Local", url: "https://jsonplaceholder.typicode.com/users" },
    { id: 5, name: "Local Service", url: "http://localhost:9001" },
    { id: 6, name: "Vijay", url: "http://vijay4u.in" },
    { id: 7, name: "Framer", url: "https://framer.com/projects/" },
    { id: 8, name: "Wiki", url: "https://www.wikipedia.org/" },
  ]);

  const servicesRef = useRef(services);

  useEffect(() => {
    servicesRef.current = services;
  }, [services]);

  const checkStatus = async (service) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(service.url, {
        method: "GET",
        mode: "no-cors",
        signal: controller.signal,
      });

      const status =
        response.ok || response.type === "opaque" ? "Online" : "Offline";

      return {
        ...service,
        status,
        lastChecked: new Date().toLocaleTimeString(),
        loading: false,
      };
    } catch (error) {
      return {
        ...service,
        status: "Offline",
        lastChecked: new Date().toLocaleTimeString(),
        loading: false,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const refreshStatus = useCallback(async () => {
    const updatedServices = await Promise.all(
      servicesRef.current.map(async (service) => {
        const updated = await checkStatus(service);
        if (updated.status === "Offline") {
          return await checkStatus(service);
        }
        return updated;
      })
    );
    setServices(updatedServices);
  }, []);

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 10000);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  return (
    <div className="app">
      <h1>Service Status Monitor</h1>
      <div className="update-indicator">Live Updates Every 10 Seconds</div>
      <div className="status-table">
        <div className="table-header">
          <div>Service Name</div>
          <div>Endpoint</div>
          <div>Status</div>
          <div>Last Checked</div>
        </div>
        {services.map((service) => (
          <div
            key={service.id}
            className={`table-row ${service.status?.toLowerCase()}`}
          >
            <div>{service.name}</div>
            <div className="url">{service.url}</div>
            <div className="status-indicator">
              <span
                className={`status-dot ${service.status?.toLowerCase()}`}
              ></span>
              {service.status}
            </div>
            <div>{service.lastChecked}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
