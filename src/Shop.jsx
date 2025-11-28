import React, { useState } from "react";

// Mock Data
const PRODUCTS = [
  { id: 1, name: "Gaming Laptop", price: 1200, img: "https://placehold.co/200?text=Laptop" },
  { id: 2, name: "Mechanical Keyboard", price: 100, img: "https://placehold.co/200?text=Keyboard" },
  { id: 3, name: "Wireless Mouse", price: 50, img: "https://placehold.co/200?text=Mouse" },
  { id: 4, name: "Headset", price: 80, img: "https://placehold.co/200?text=Headset" },
];

export default function Shop() {
  const [page, setPage] = useState("shop"); // 'shop' or 'cart'
  const [cart, setCart] = useState({});

  // Add Item
  const addToCart = (id) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  // Remove Item
  const removeFromCart = (id) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[id] > 1) {
        newCart[id] -= 1;
      } else {
        delete newCart[id];
      }
      return newCart;
    });
  };

  // Calculate Total
  const getTotalAmount = () => {
    let total = 0;
    for (const id in cart) {
      const product = PRODUCTS.find((p) => p.id === Number(id));
      if (product) total += product.price * cart[id];
    }
    return total;
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <div>
      {/* Navbar */}
      <nav>
        <h2>TechStore</h2>
        <div>
          <button className={`nav-btn ${page === 'shop' ? 'active' : ''}`} onClick={() => setPage("shop")}>
            Shop
          </button>
          <button className={`nav-btn ${page === 'cart' ? 'active' : ''}`} onClick={() => setPage("cart")}>
            Cart ({totalItems})
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="container">
        {page === "shop" ? (
          <div className="grid">
            {PRODUCTS.map((product) => (
              <div key={product.id} className="card">
                <img src={product.img} alt={product.name} />
                <h3>{product.name}</h3>
                <p>${product.price}</p>
                <button className="add-btn" onClick={() => addToCart(product.id)}>
                  Add to Cart {cart[product.id] > 0 && `(${cart[product.id]})`}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <h2>Your Cart</h2>
            {Object.keys(cart).length === 0 ? <p>Cart is empty.</p> : (
              <div>
                {Object.keys(cart).map((id) => {
                  const product = PRODUCTS.find((p) => p.id === Number(id));
                  return (
                    <div key={id} className="cart-item">
                      <span>{product.name} (x{cart[id]})</span>
                      <div>
                        <span>${product.price * cart[id]}</span>
                        <button className="minus-btn" style={{marginLeft: '10px'}} onClick={() => removeFromCart(id)}>-</button>
                        <button className="plus-btn" onClick={() => addToCart(id)}>+</button>
                      </div>
                    </div>
                  );
                })}
                <div className="total">Total: ${getTotalAmount()}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
