//influencer-dashboard_v2/src/components/Login.js       
import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';

function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🔐 LOCKOUT STATE VARIABLES
  const [attemptCount, setAttemptCount] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [lockUntil, setLockUntil] = useState(null);
  const [countdownText, setCountdownText] = useState("");
  const [lockActive, setLockActive] = useState(false);
  const navigate = useNavigate();

  console.log("Attempt: ",attemptCount);

  // 📦 PHASE CONFIGURATION
  const phaseConfig = {
    1: { limit: 5, duration: 30 * 1000 },
    2: { limit: 3, duration: 60 * 1000 },
    3: { limit: 2, duration: 90 * 1000 },
    4: { limit: 1, duration: 15 * 60 * 1000 },
  };

  // 🕒 INITIALIZE LOCK STATE ON PAGE LOAD
  useEffect(() => {
    const storedPhase = Number(sessionStorage.getItem('currentPhase')) || 1;
    const storedAttempts = Number(sessionStorage.getItem('attemptCount')) || 0;
    const storedLock = sessionStorage.getItem('lockUntil');

    setCurrentPhase(storedPhase);
    setAttemptCount(storedAttempts);

    if (storedLock && Date.now() < storedLock) {
      setLockUntil(Number(storedLock));
      setLockActive(true);
      startCountdown(Number(storedLock));
    }
  }, []);

  // ⏳ COUNTDOWN TIMER FUNCTION
  const startCountdown = (lockTime) => {
    setLockActive(true);
    const interval = setInterval(() => {
      const diff = lockTime - Date.now();
      if (diff <= 0) {
        clearInterval(interval);
        setLockActive(false);
        setCountdownText("");
        setAttemptCount(0);

        // move to next phase or reset
        setCurrentPhase((prev) => {
          const nextPhase = prev < 4 ? prev + 1 : 1;
          sessionStorage.setItem('currentPhase', nextPhase);
          return nextPhase;
        });

        sessionStorage.removeItem('lockUntil');
        sessionStorage.setItem('attemptCount', 0);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setCountdownText(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
      }
    }, 1000);
  };

  // 🚀 HANDLE LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // 1️⃣ Check if locked
    if (lockActive && lockUntil && Date.now() < lockUntil) {
      setError(`Login disabled for ${countdownText || "a few"} seconds.`);
      return;
    }

    setLoading(true);

    try {
      const res = await API.post('/auth/login', { email, password });

      if (!res.data.token) {
        setError("Login failed: No token returned");
        return;
      }

      // ✅ Success: clear lock data
      sessionStorage.setItem('token', res.data.token);
      sessionStorage.removeItem('attemptCount');
      sessionStorage.removeItem('currentPhase');
      sessionStorage.removeItem('lockUntil');
      sessionStorage.removeItem('lockedEmail');

      setToken(res.data.token);
      navigate('/dashboard');

      } catch (err) {
        const message = err.response?.data?.error || err.message || "Login failed";
        console.log(message);
        setError("Invalid credentials");

        // 2️⃣ Update attempt count
        let storedPhase = Number(sessionStorage.getItem('currentPhase')) || currentPhase;
        let storedAttempts = Number(sessionStorage.getItem('attemptCount')) || 0;
        const phaseLimit = phaseConfig[storedPhase].limit;
        const lockDuration = phaseConfig[storedPhase].duration;

        storedAttempts += 1;
        sessionStorage.setItem('attemptCount', storedAttempts);
        sessionStorage.setItem('currentPhase', storedPhase);
        sessionStorage.setItem('lockedEmail', email);
        setAttemptCount(storedAttempts);

        // ⏳ Remaining attempts
        const remainingAttempts = phaseLimit - storedAttempts;

        // 🧩 Show “Invalid credentials” first, then attempts left (if applicable)
        if (remainingAttempts > 0) {
          setTimeout(() => {
            setError(
              remainingAttempts === 1
                ? "Only 1 attempt left."
                : `Only ${remainingAttempts} attempts left.`
            );
          }, 1000);
        }

        // 🚫 Lock user if exceeded limit
        if (storedAttempts >= phaseLimit) {
          const lockTime = Date.now() + lockDuration;
          sessionStorage.setItem('lockUntil', lockTime);
          setLockUntil(lockTime);
          setLockActive(true);

          // 🕒 Directly start timer (no error popup)
          setError(""); // hide error immediately
          startCountdown(lockTime);
        }
      }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Influencer Login</h2>
      <form onSubmit={handleLogin} className="login-form">
        <div className='try'>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={lockActive || loading}
          />
        </div>
        <div className='try'>
          <label htmlFor="login-password">Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="login-password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={lockActive || loading}
            />
            {showPassword
              ? <FaEye className="eye-icon" onClick={() => setShowPassword(false)} />
              : <FaEyeSlash className="eye-icon" onClick={() => setShowPassword(true)} />
            }
          </div>
        </div>
        <button type="submit" disabled={loading || lockActive}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* 🔒 Countdown + error messages */}
      {lockActive && (
        <div className="lockout-message">
          Login disabled for {countdownText}
        </div>
      )}

      {error && <div className="error" role="alert">{error}</div>}

      <div className="login-actions">
        <button className="action-btn" onClick={() => navigate('/request')}>Go to Request Form</button>
        <button className="action-btn" onClick={() => navigate('/')}>Back to Landing Page</button>
      </div>
    </div>
  );
}

export default Login;
