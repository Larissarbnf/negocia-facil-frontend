import React from "react";
import "./ProductControls.css";

function ProductControls({ search, onSearchChange, onAddClick }) {
  return (
    <div className="controls-container">
      <input
        type="text"
        placeholder="Buscar"
        className="search-input"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <button className="add-button" onClick={onAddClick}>
        Cadastrar Novo Produto
      </button>
    </div>
  );
}

export default ProductControls;