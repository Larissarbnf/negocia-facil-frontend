import { Trash } from "lucide-react";

export function TrashButton({ onDelete, product }) {
    return (
        <button onClick={() => {onDelete(product.id)}}>
            <Trash size={20}/>
        </button>
    );
}