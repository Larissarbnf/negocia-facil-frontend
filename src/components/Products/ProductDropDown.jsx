import "./ProductCard.css";

export function DropDownProduct({ product, onEdit, onDelete }){
    
    const [menuOpen, setMenuOpen] = useState(false);
    
    return (
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
    )
}