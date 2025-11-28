import React, { useState, useEffect } from "react";

// Initial Dummy Data (যদি লোকাল স্টোরেজে কিছু না থাকে)
const INITIAL_PRODUCTS = [
  { id: 1, name: "MacBook Pro M2", price: 1499, img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80" },
  { id: 2, name: "Sony WH-1000XM5", price: 348, img: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=500&q=80" },
  { id: 3, name: "iPhone 15 Pro", price: 999, img: "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=500&q=80" },
  { id: 4, name: "Mechanical Keychron", price: 89, img: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=500&q=80" },
];

export default function Shop() {
  // --- STATE MANAGEMENT ---
  const [view, setView] = useState("shop"); // 'shop', 'cart', 'admin-login', 'admin'
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState({});
  
  // Admin States
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", img: "" });

  // --- LOCAL STORAGE LOGIC ---
  // Load data on start
  useEffect(() => {
    const savedProducts = localStorage.getItem("shopProducts");
    const savedCart = localStorage.getItem("shopCart");
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // Save data on change
  useEffect(() => {
    localStorage.setItem("shopProducts", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("shopCart", JSON.stringify(cart));
  }, [cart]);

  // --- SHOP FUNCTIONS ---
  const addToCart = (id) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[id] > 1) newCart[id] -= 1;
      else delete newCart[id];
      return newCart;
    });
  };

  const clearCart = () => {
    setCart({});
    alert("Checkout Successful! Thank you for purchasing.");
    setView("shop");
  };

  const getTotalPrice = () => {
    return Object.keys(cart).reduce((total, id) => {
      const product = products.find((p) => p.id === Number(id));
      return product ? total + product.price * cart[id] : total;
    }, 0);
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  // --- ADMIN FUNCTIONS ---
  const handleLogin = () => {
    if (password === "srp009") {
      setIsAdmin(true);
      setView("admin");
      setPassword("");
    } else {
      alert("Wrong Password! Access Denied.");
    }
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.img) {
      alert("Please fill all fields!");
      return;
    }
    const newId = Date.now(); // Unique ID based on timestamp
    const productToAdd = { ...newProduct, id: newId, price: Number(newProduct.price) };
    
    setProducts([...products, productToAdd]);
    setNewProduct({ name: "", price: "", img: "" });
    alert("Product Added Successfully!");
  };

  const deleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter(p => p.id !== id));
      // Remove from cart if exists
      const newCart = { ...cart };
      delete newCart[id];
      setCart(newCart);
    }
  };

  // --- RENDER VIEWS ---
  
  // 1. SHOP VIEW
  const renderShop = () => (
    <div className="grid">
      {products.map((product) => (
        <div key={product.id} className="card">
          <img src={product.img} alt={product.name} onError={(e) => e.target.src='https://placehold.co/400?text=No+Image'} />
          <div className="card-body">
            <h3>{product.name}</h3>
            <div className="price">${product.price}</div>
            <button className="btn btn-primary" onClick={() => addToCart(product.id)}>
              Add to Cart {cart[product.id] > 0 && `(${cart[product.id]})`}
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // 2. CART VIEW
  const renderCart = () => (
    <div className="cart-container">
      <h2 style={{borderBottom: '2px solid #eee', paddingBottom: '10px'}}>Shopping Cart</h2>
      {Object.keys(cart).length === 0 ? (
        <p style={{textAlign:'center', color:'#888', marginTop:'20px'}}>Your cart is currently empty.</p>
      ) : (
        <div>
          {Object.keys(cart).map((id) => {
            const product = products.find((p) => p.id === Number(id));
            if (!product) return null;
            return (
              <div key={id} className="cart-item">
                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                  <img src={product.img} style={{width:'60px', height:'60px', borderRadius:'8px', objectFit:'cover'}} />
                  <div>
                    <h4 style={{margin:0}}>{product.name}</h4>
                    <small style={{color:'#888'}}>${product.price} x {cart[id]}</small>
                  </div>
                </div>
                <div className="cart-controls">
                  <button onClick={() => removeFromCart(id)}>-</button>
                  <span style={{margin:'0 10px'}}>{cart[id]}</span>
                  <button onClick={() => addToCart(id)}>+</button>
                </div>
                <div style={{fontWeight:'bold'}}>${product.price * cart[id]}</div>
              </div>
            );
          })}
          <div className="total-section">
            Total: <span style={{color:'var(--primary)'}}>${getTotalPrice()}</span>
          </div>
          <button className="btn btn-primary" style={{marginTop:'20px'}} onClick={clearCart}>
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );

  // 3. ADMIN LOGIN VIEW
  const renderLogin = () => (
    <div className="admin-login">
      <h2>Admin Access</h2>
      <p style={{color:'#666'}}>Enter the secured password to manage inventory.</p>
      <input 
        type="password" 
        className="admin-input" 
        placeholder="Enter Password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="btn btn-primary" onClick={handleLogin}>Login</button>
    </div>
  );

  // 4. ADMIN DASHBOARD VIEW
  const renderAdmin = () => (
    <div className="dashboard">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <h2>Admin Dashboard</h2>
        <button className="btn btn-danger" onClick={() => { setIsAdmin(false); setView('shop'); }}>Logout</button>
      </div>

      {/* Add Product Form */}
      <div className="add-product-form">
        <h3 className="full-width">Add New Product</h3>
        <input 
          className="admin-input" 
          placeholder="Product Name" 
          value={newProduct.name} 
          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} 
        />
        <input 
          className="admin-input" 
          type="number" 
          placeholder="Price ($)" 
          value={newProduct.price} 
          onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} 
        />
        <input 
          className="admin-input full-width" 
          placeholder="Image URL (e.g. https://image.com/pic.jpg)" 
          value={newProduct.img} 
          onChange={(e) => setNewProduct({...newProduct, img: e.target.value})} 
        />
        <button className="btn btn-primary full-width" onClick={addProduct}>+ Add Product</button>
      </div>

      {/* Product List */}
      <h3>Current Inventory ({products.length})</h3>
      <div>
        {products.map((p) => (
          <div key={p.id} className="product-row">
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
              <img src={p.img} style={{width:'40px', height:'40px', borderRadius:'4px', objectFit:'cover'}} />
              <strong>{p.name}</strong>
            </div>
            <div>
              <span style={{marginRight:'15px', fontWeight:'bold'}}>${p.price}</span>
              <button className="btn btn-danger" onClick={() => deleteProduct(p.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {/* Navbar */}
      <nav>
        <h2>LUXE<span style={{color:'#1e40af'}}>TECH</span></h2>
        <div className="nav-links">
          <button className={`nav-btn ${view === 'shop' ? 'active' : ''}`} onClick={() => setView("shop")}>Shop</button>
          <button className={`nav-btn ${view === 'cart' ? 'active' : ''}`} onClick={() => setView("cart")}>
            Cart ({totalItems})
          </button>
          <button className={`nav-btn ${view === 'admin' || view === 'admin-login' ? 'active' : ''}`} onClick={() => setView(isAdmin ? "admin" : "admin-login")}>
            Admin
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container">
        {view === "shop" && renderShop()}
        {view === "cart" && renderCart()}
        {view === "admin-login" && renderLogin()}
        {view === "admin" && renderAdmin()}
      </div>
    </div>
  );
}
