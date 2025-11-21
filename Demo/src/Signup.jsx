// src/Signup.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); // New State
    const [role, setRole] = useState("Student"); // New State (Default: Student)
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. Validation: Check passwords
        if(password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // 2. Send data (including role)
        axios.post('http://localhost:3001/register', { name, email, password, role })
            .then(result => {
                console.log(result);
                navigate('/login');
            })
            .catch(err => console.log(err));
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Create Account</h2>
                <form onSubmit={handleSubmit}>
                    
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input type="text" className="form-control" placeholder="Enter your name" 
                            onChange={(e) => setName(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" className="form-control" placeholder="Enter your email" 
                            onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Register As</label>
                        <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="Student">Student</option>
                            <option value="Instructor">Instructor</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" className="form-control" placeholder="Create a password" 
                            onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input type="password" className="form-control" placeholder="Confirm password" 
                            onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>

                    <button type="submit" className="btn-auth">Sign Up</button>
                </form>
                
                <p className="auth-footer">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;