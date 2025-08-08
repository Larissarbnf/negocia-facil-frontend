import React, { useState } from "react";
import "./ProductCard.css";
import { TrashButton } from "./TrashButton";
import { Checkbox } from "../Advertisement/Checkbox";

function ProductCard({ product, onEdit, onDelete, showMenuOptions, showTrashButton, showCheckBox, selectedProducts,toggleProductSelection }) {
  const {
    title,
    price,
    quantity,
    category,
    forExchange,
    description,
    imageUrl,
  } = product;

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="card">
      {imageUrl && <img src={imageUrl} className="thumb" alt={title} />}

      <div className="body">
        <div className="top-row">
          <h3>{title}</h3>
          <div className="actions">
            {showMenuOptions ? (
              <div className="menu-container">
                <button
                  className="menu-button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  >
                  ⋮
                </button>
                {menuOpen && (
                  <div className="dropdown-menu">
                    <button onClick={() => onEdit(product)}>Editar</button>
                    <button onClick={() => onDelete(product.id)}>Excluir</button>
                  </div>
                )}
              </div>
            ) : (<></>)}
            {showTrashButton ? (
              <TrashButton
                onDelete={onDelete}
                product={product}/>
            ):( <></>)}
            {showCheckBox ? (
              <Checkbox
                label={product.title}
                checked={selectedProducts?.some(p => p.id === product.id)}
                onChange={() => toggleProductSelection(product)}
              />
            ):( <></>)}
          </div>
        </div>

        <div className="info-row">
          <span className="price">
            {price.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
          <span className="qty">qtd:{quantity}</span>
        </div>

        <div className="info-row">
          <span className="category">{category}</span>
          <span className="exchange">{forExchange ? "Troca" : "Venda"}</span>
        </div>

        <p className="description">{description}</p>
      </div>
    </div>
  );
}

export default ProductCard;