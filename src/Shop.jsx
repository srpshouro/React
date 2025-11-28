import React, { useState, useEffect } from "react";

// আপনার দেওয়া API Key টি এখানে সেট করা হয়েছে
const IMGBB_KEY = "8830f9556245fc1bcc8493b2c50c6760";

const INITIAL_PRODUCTS = [
  { id: 1, name: "MacBook Pro M2", price: 1499, img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80" },
  { id: 2, name: "Sony WH-1000XM5", price: 348, img: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=500&q=80" },
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
  const [isUploading, setIsUploading] = useState(false); // লোডিং স্টেট

  // --- LOCAL STORAGE LOGIC ---
  useEffect(() => {
    const savedProducts = localStorage.getItem("shopProducts");
    const savedCart = localStorage.getItem("shopCart");
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

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

  // --- IMGBB IMAGE UPLOAD ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      // ImgBB API Call
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      
      if (data.success) {
        setNewProduct({ ...newProduct, img: data.data.url });
      } else {
        alert("Upload Failed: " + (data.error ? data.error.message : "Unknown Error"));
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Something went wrong while uploading. Check your internet connection.");
    } finally {
      setIsUploading(false);
    }
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.img) {
      alert("Please fill name, price and upload an image!");
      return;
    }
    const newId = Date.now();
    const productToAdd = { ...newProduct, id: newId, price: Number(newProduct.price) };
    
    setProducts([...products, productToAdd]);
    setNewProduct({ name: "", price: "", img: "" });
    document.getElementById('fileInput').value = ""; // Clear file input
    alert("Product Added Successfully!");
  };

  const deleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter(p => p.id !== id));
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
          <div className="card-img-container">
            <img src={product.img} alt={product.name} onError={(e) => e.target.src='https://placehold.co/400?text=Error'} />
          </div>
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
      <h2 className="section-title">Shopping Cart</h2>
      {Object.keys(cart).length === 0 ? (
        <p style={{textAlign:'center', color:'#888', marginTop:'20px'}}>Your cart is currently empty.</p>
      ) : (
        <div>
          {Object.keys(cart).map((id) => {
            const product = products.find((p) => p.id === Number(id));
            if (!product) return null;
            return (
              <div key={id} className="cart-item">
                <div className="cart-info">
                  <img src={product.img} />
                  <div>
                    <h4 style={{margin:0}}>{product.name}</h4>
                    <small style={{color:'#888'}}>${product.price} x {cart[id]}</small>
                  </div>
                </div>
                <div className="cart-controls">
                  <button onClick={() => removeFromCart(id)}>-</button>
                  <span>{cart[id]}</span>
                  <button onClick={() => addToCart(id)}>+</button>
                </div>
                <div className="item-total">${product.price * cart[id]}</div>
              </div>
            );
          })}
          <div className="total-section">
            Total: <span>${getTotalPrice()}</span>
          </div>
          <button className="btn btn-primary mt-20" onClick={clearCart}>
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
      <p style={{color:'#666'}}>Enter the secured password.</p>
      <input 
        type="password" 
        className="admin-input" 
        placeholder="Enter Password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="btn btn-primary" style={{marginTop:'15px'}} onClick={handleLogin}>Login</button>
    </div>
  );

  // 4. ADMIN DASHBOARD VIEW
  const renderAdmin = () => (
    <div className="dashboard">
      <div className="dashboard-header">
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

        {/* IMAGE UPLOAD SECTION */}
        <div className="full-width upload-box">
          <label>Product Image:</label>
          <input 
            type="file" 
            accept="image/*" 
            id="fileInput"
            onChange={handleImageUpload} 
            disabled={isUploading}
          />
          
          {isUploading && <p className="loading-text">⏳ Uploading image to cloud... Please wait.</p>}
          
          {newProduct.img && !isUploading && (
            <div className="preview-box">
              <img src={newProduct.img} alt="Preview" />
              <p>✅ Image Uploaded Successfully!</p>
            </div>
          )}
        </div>

        <button className="btn btn-primary full-width" onClick={addProduct} disabled={isUploading}>
          {isUploading ? "Uploading..." : "+ Add Product"}
        </button>
      </div>

      {/* Product List */}
      <h3>Current Inventory ({products.length})</h3>
      <div className="inventory-list">
        {products.map((p) => (
          <div key={p.id} className="product-row">
            <div className="row-info">
              <img src={p.img} onError={(e) => e.target.src='https://placehold.co/50'} />
              <strong>{p.name}</strong>
            </div>
            <div className="row-actions">
              <span>${p.price}</span>
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
        <h2>LUXE<span>TECH</span></h2>
        <div className="nav-links">
          <button className={view === 'shop' ? 'active' : ''} onClick={() => setView("shop")}>Shop</button>
          <button className={view === 'cart' ? 'active' : ''} onClick={() => setView("cart")}>
            Cart ({totalItems})
          </button>
          <button className={view === 'admin' || view === 'admin-login' ? 'active' : ''} onClick={() => setView(isAdmin ? "admin" : "admin-login")}>
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
