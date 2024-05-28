import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { RiHome2Fill, RiSettings2Fill, RiFileEditFill } from 'react-icons/ri';
import RestEndpoint from "./RestEndPoint";
import SchemaBuilder from "./SchemaBuilder";
import JsonMapper from "./JsonMapper";

function Home() {
  const [activeComponent, setActiveComponent] = useState(null);
  const navigate = useNavigate();

  const handleNavigation = (component) => {
    setActiveComponent(component);
    switch (component) {
      case "RestEndpoint":
        navigate("/rest-endpoint");
        break;
      case "SchemaBuilder":
        navigate("/schema-builder");
        break;
      case "JsonMapper":
        navigate("/json-mapper");
        break;
      default:
        break;
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-3 col-md-4 bg-light border">
          <div className="d-flex flex-column p-3">
            <button
              className={`btn btn-primary mb-3 ${activeComponent === "RestEndpoint" && "active"}`}
              onClick={() => handleNavigation("RestEndpoint")}
              title="Rest Endpoint"
            >
              <RiHome2Fill className="me-2" /> Rest Endpoint
            </button>
            <button
              className={`btn btn-secondary mb-3 ${activeComponent === "SchemaBuilder" && "active"}`}
              onClick={() => handleNavigation("SchemaBuilder")}
              title="Schema Builder"
            >
              <RiFileEditFill className="me-2" /> Schema Builder
            </button>
            <button
              className={`btn btn-success ${activeComponent === "JsonMapper" && "active"}`}
              onClick={() => handleNavigation("JsonMapper")}
              title="Json Mapper"
            >
              <RiSettings2Fill className="me-2" /> Json Mapper
            </button>
          </div>
        </div>
        <div className="col-lg-9 col-md-8 border">
          <Routes>
            <Route path="/rest-endpoint" element={<RestEndpoint />} />
            <Route path="/schema-builder" element={<SchemaBuilder />} />
            <Route path="/json-mapper" element={<JsonMapper />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Home;
