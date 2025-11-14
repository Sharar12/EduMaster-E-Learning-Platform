// src/Cart.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css";

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);

  // Fake Payment State
  const [cardInfo, setCardInfo] = useState({ number: "", expiry: "", cvc: "" });

  useEffect(() => {
    // 1. Load User
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    // 2. Load Cart
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, []);

  // Calculate Total
  const totalPrice = cart.reduce((acc, item) => acc + item.price, 0);

  const removeFromCart = (index) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage")); // Update Navbar
  };

  const handlePurchase = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login first!");
      navigate("/login");
      return;
    }

    if (cart.length === 0) return;

    try {
      // Call Backend API
      const res = await axios.post("http://localhost:3001/purchase", {
        userId: user._id,
        cartItems: cart,
      });

      if (res.data.status === "Success") {
        alert("Purchase Successful! Welcome to your new courses.");

        // 1. Update LocalStorage "user" with the new enrolled courses
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // 2. Clear Cart
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("storage"));

        // 3. Redirect to Student Dashboard
        navigate("/dashboard/student");
        window.location.reload(); // Reload to refresh dashboard state
      }
    } catch (err) {
      console.log(err);
      alert("Transaction Failed.");
    }
  };

  return (
    <div
      className="landing-container"
      style={{ padding: "50px", maxWidth: "1200px", margin: "0 auto" }}
    >
      <h1>Shopping Cart</h1>

      {cart.length === 0 ? (
        <div style={{ textAlign: "center", margin: "50px" }}>
          <h3>Your cart is empty.</h3>
          <button className="btn-primary-outline" onClick={() => navigate("/")}>
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="course-detail-container" style={{ margin: "20px 0" }}>
          {/* LEFT: ITEMS LIST */}
          <div className="detail-content">
            {cart.map((item, index) => (
              <div key={index} className="video-list-item">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "20px" }}
                >
                  <img
                    src={item.thumbnail}
                    alt="thumb"
                    style={{
                      width: "80px",
                      height: "50px",
                      objectFit: "cover",
                      borderRadius: "5px",
                    }}
                  />
                  <div>
                    <strong>{item.title}</strong>
                    <p style={{ fontSize: "12px", color: "#777" }}>
                      Instructor: {item.instructorName}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <h4 style={{ color: "#27ae60" }}>${item.price}</h4>
                  <button
                    style={{
                      color: "red",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                    onClick={() => removeFromCart(index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: CHECKOUT FORM */}
          <aside className="detail-sidebar">
            <div className="buy-card" style={{ textAlign: "left" }}>
              <h3>Summary</h3>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  margin: "10px 0",
                }}
              >
                <span>Total:</span>
                <span style={{ fontSize: "20px", fontWeight: "bold" }}>
                  ${totalPrice}
                </span>
              </div>

              <hr style={{ margin: "20px 0", borderColor: "#eee" }} />

              <h4>Payment Details</h4>
              <form onSubmit={handlePurchase}>
                <label style={{ fontSize: "12px" }}>Card Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="1234 5678 9101 1121"
                  required
                  maxLength="16"
                  onChange={(e) =>
                    setCardInfo({ ...cardInfo, number: e.target.value })
                  }
                  style={{ marginBottom: "10px" }}
                />

                <div style={{ display: "flex", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "12px" }}>Expiry</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="MM/YY"
                      required
                      style={{ marginBottom: "10px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px" }}>CVC</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="123"
                      required
                      maxLength="3"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="hero-btn"
                  style={{ width: "100%", marginTop: "15px" }}
                >
                  Complete Purchase
                </button>
              </form>

              <p
                style={{
                  fontSize: "11px",
                  color: "#999",
                  marginTop: "10px",
                  textAlign: "center",
                }}
              >
                This is a secure 128-bit SSL encrypted payment.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default Cart;
