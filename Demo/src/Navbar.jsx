// src/Navbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react"; // Import useEffect
import "./style.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const isDashboard = location.pathname.includes("dashboard");

  // --- NEW: CART COUNT LOGIC ---
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.length);
  };

  useEffect(() => {
    updateCartCount(); // Initial load

    // Listen for custom event 'storage' (triggered when we add/remove items)
    window.addEventListener("storage", updateCartCount);

    return () => window.removeEventListener("storage", updateCartCount);
  }, []);
  // -----------------------------

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("cart"); // Optional: Clear cart on logout
    navigate("/");
    window.location.reload();
  };

  const getDashboardPath = () => {
    if (user?.role === "Admin" || user?.role === "Super Admin")
      return "/dashboard/admin";
    if (user?.role === "Instructor") return "/dashboard/instructor";
    return "/dashboard/student";
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        EduMaster
      </Link>

      <div
        className="nav-links"
        style={{ display: "flex", alignItems: "center", gap: "20px" }}
      >
        <Link to="/">Home</Link>

        {/* CART LINK (Visible to Everyone except pure dashboard views if preferred, but nice to have everywhere) */}
        {!isDashboard && (
          <Link to="/cart" style={{ fontWeight: "bold" }}>
            Cart{" "}
            {cartCount > 0 && (
              <span
                style={{
                  background: "red",
                  color: "white",
                  padding: "2px 6px",
                  borderRadius: "50%",
                  fontSize: "12px",
                  verticalAlign: "top",
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>
        )}

        {user ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  fontWeight: "bold",
                  color: "var(--color-text-primary)",
                }}
              >
                {user.name}
              </span>

              <Link
                to={getDashboardPath()}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  overflow: "hidden", // Ensures image stays in circle
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#4A90E2",
                  textDecoration: "none",
                  border: "2px solid var(--color-accent)",
                }}
              >
                {/* LOGIC: Show Image if exists, else show First Letter */}
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="User"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span style={{ color: "white", fontWeight: "bold" }}>
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            </div>
            <button className="btn-primary-outline" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-primary-outline">
              Login
            </Link>
            <Link
              to="/register"
              style={{ fontWeight: "bold", color: "#4A90E2" }}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
