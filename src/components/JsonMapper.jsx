import React, { useState, useContext, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ArcherContainer, ArcherElement } from 'react-archer';
import 'bootstrap/dist/css/bootstrap.min.css';
import JsonContext from './JsonContext';

const ItemTypes = {
  KEY: 'key',
};

const DraggableKey = ({ id, name, children }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.KEY,
    item: { id, name },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }} className="list-group-item">
      {children}
    </div>
  );
};

const DroppableKey = ({ id, onDrop, children }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.KEY,
    drop: (item) => onDrop(item, id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div ref={drop} style={{ backgroundColor: isOver ? 'lightyellow' : 'inherit' }} className="list-group-item">
      {children}
    </div>
  );
};

const JsonMapper = () => {
  const { sourceJson, targetJson } = useContext(JsonContext);
  const [mappings, setMappings] = useState([]);
  const [updatedSourceJson, setUpdatedSourceJson] = useState('');
  const sourceRefs = useRef({});
  const targetRefs = useRef({});

  const applyMapping = (obj, mappings, parentKey = '') => {
    const newObj = {};

    Object.keys(obj).forEach(key => {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      const value = obj[key];
      const mapping = mappings.find(m => m.source === fullKey);

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        newObj[mapping ? mapping.target.split('.').pop() : key] = applyMapping(value, mappings, fullKey);
      } else {
        if (mapping && mapping.source === fullKey) {
          newObj[mapping.target.split('.').pop()] = value;
        } else {
          newObj[key] = value;
        }
      }
    });

    return newObj;
  };

  useEffect(() => {
    if (sourceJson && sourceJson.length > 0) {
      const updatedJson = sourceJson.map(obj => applyMapping(obj, mappings));
      setUpdatedSourceJson(JSON.stringify(updatedJson, null, 2));
    }
  }, [mappings, sourceJson]);

  const handleDrop = (sourceItem, targetKey) => {
    const mappingExists = mappings.some(mapping => mapping.source === sourceItem.name && mapping.target === targetKey);
    if (mappingExists) {
      return;
    }

    setMappings(prevMappings => {
      return [...prevMappings, { source: sourceItem.name, target: targetKey }];
    });
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };
  

  const handleCancelMapping = sourceKey => {
    setMappings(mappings.filter(mapping => mapping.source !== sourceKey));
  };

  const renderObject = (obj, isSource = false, parentKey = '') => {
    return (
      <ul className="list-group">
        {Object.entries(obj).map(([key, value]) => {
          const mapping = mappings.find((m) => m.source === (parentKey ? `${parentKey}.${key}` : key));
          const fullKey = parentKey ? `${parentKey}.${key}` : key;
          return (
            <li key={fullKey} className="list-group-item">
              {isSource ? (
                <DraggableKey id={fullKey} name={fullKey}>
                  <span className="fw-bold">{key}:</span> {JSON.stringify(value)}
                  {mapping && isSource && (
                    <button className="btn btn-sm btn-danger ms-2" onClick={() => handleCancelMapping(mapping.source)}>
                      &times;
                    </button>
                  )}
                </DraggableKey>
              ) : (
                <DroppableKey id={fullKey} onDrop={handleDrop}>
                  <span className="fw-bold">{key}:</span> {JSON.stringify(value)}
                </DroppableKey>
              )}
              {typeof value === 'object' && value !== null && !Array.isArray(value) && (
                renderObject(value, isSource, fullKey)
              )}
            </li>
          );
        })}
      </ul>
    );
  };
  
  
  const renderMappings = () => {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF']; // Define colors for arrows
    const renderedMappings = [];
  
    mappings.forEach((mapping, index) => {
      const sourceElement = sourceRefs.current[mapping.source];
      const targetElement = targetRefs.current[mapping.target];
  
      if (sourceElement && targetElement) {
        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
  
        const sourceX = sourceRect.right + 5 + window.scrollX;
        const sourceY = sourceRect.top + sourceRect.height / 2 + window.scrollY;
        const targetX = targetRect.left - 5 + window.scrollX;
        const targetY = targetRect.top + targetRect.height / 2 + window.scrollY;
  
        const color = colors[index % colors.length];
  
        renderedMappings.push(
          <line
            key={`${mapping.source}-${mapping.target}`}
            x1={sourceX}
            y1={sourceY}
            x2={targetX}
            y2={targetY}
            stroke={color}
            strokeWidth="2"
            markerEnd="url(#arrow)"
          />
        );
      }
    });
  
    return renderedMappings;
  };
  

  
  
  
  
  
  
  const saveUpdatedJson = () => {
    const jsonData = JSON.parse(updatedSourceJson);

    fetch('http://localhost:5000/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Data saved successfully:', data);
      })
      .catch(error => {
        console.error('Error saving data:', error);
      });
  };

  return (
    <DndProvider backend={HTML5Backend}>
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h3>Source JSON</h3>
            </div>
            <div className="card-body">{renderObject(sourceJson[0], true)}</div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h3>Target JSON</h3>
            </div>
            <div className="card-body">{renderObject(targetJson)}</div>
          </div>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-12 text-center">
          <button className="btn btn-primary" onClick={saveUpdatedJson}>
            Save Updated JSON
          </button>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h3>Updated Source JSON</h3>
            </div>
            <div className="card-body">
              <pre>{updatedSourceJson}</pre>
            </div>
          </div>
        </div>
      </div>
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="#000" />
          </marker>
        </defs>
        {renderMappings()}
      </svg>
    </div>
    </DndProvider>
  );
};

export default JsonMapper;