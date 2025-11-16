// src/Footer.jsx
import React from 'react';
import './style.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        
        {/* Left Side */}
        <div style={{textAlign: 'left'}}>
            <h3 className="logo" style={{color: 'white', fontSize: '20px'}}>EduMaster</h3>
            <p style={{fontSize: '14px', marginTop: '5px'}}>Empowering students worldwide.</p>
        </div>

        {/* Right Side */}
        <div className="footer-links">
            <a href="#">About Us</a>
            <a href="#">Contact</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms</a>
        </div>

        {/* Bottom */}
        <div className="copyright">
            &copy; {new Date().getFullYear()} EduMaster Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;