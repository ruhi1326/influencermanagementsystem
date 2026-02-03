import React, { useEffect } from "react";
import "../css/Landing.css";
import { Link } from "react-router-dom";

const Landing = () => {
  const toggleTheme = () => {
    const body = document.body;
    const button = document.querySelector(".toggle-switch");
    body.classList.toggle("dark-mode");
    button.classList.toggle("active");
    localStorage.setItem(
      "theme",
      body.classList.contains("dark-mode") ? "dark" : "light"
    );
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const button = document.querySelector(".toggle-switch");
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
      button?.classList.add("active");
    }

    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("active");
      });
    }, observerOptions);
    document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute("href"));
        if (target) target.scrollIntoView({ behavior: "smooth" });
      });
    });
  }, []);

  return (
    <>
      <header>
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="100" fill="#1e3a8a" />
                <rect x="45" y="95" width="18" height="55" fill="#5b9fd6" rx="2" />
                <rect x="68" y="65" width="18" height="85" fill="white" rx="2" />
                <rect x="91" y="85" width="18" height="65" fill="#5b9fd6" rx="2" />
                <rect x="114" y="45" width="18" height="105" fill="white" rx="2" />
                <line
                  x1="35"
                  y1="135"
                  x2="95"
                  y2="85"
                  stroke="white"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                <line
                  x1="95"
                  y1="85"
                  x2="160"
                  y2="35"
                  stroke="white"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                <polygon points="170,25 155,42 168,55" fill="white" />
              </svg>
            </div>
            One Bird Agency
          </div>
          <nav>
            <a href="#services">Services</a>
            <a href="#testimonials">Testimonials</a>
            <a href="#community">Community</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="header-buttons">
            <button
              className="toggle-switch"
              onClick={toggleTheme}
              title="Toggle Dark Mode"
            ></button>
                <Link to="/login">
                 <button className="login-button">
                Login
                </button>
                </Link>
                
          </div>
        </div>
      </header>



      {/* ✅ HERO SECTION (IDENTICAL RESTORE) */}
<section className="hero">
  <div className="hero-bg-decor">
    <div className="circle circle1"></div>
    <div className="circle circle2"></div>
    <div className="circle circle3"></div>
  </div>

  <div className="hero-container">
    <div className="hero-content">
      <h1>
        Elevate Your Brand with{" "}
        <span className="brand-name">One Bird Agency</span>
      </h1>
      <p>
        Connect with authentic influencers and create campaigns that
        resonate with your audience.
      </p>
      <a href="#services" className="cta-button">
        Explore Services
      </a>
    </div>

    <div className="hero-image">
      <img
        src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop"
        alt="Team Collaboration Meeting"
      />
    </div>
  </div>
</section>

    {/* ✅ SERVICES SECTION — identical to HTML */}
        <section id="services">
        <h2 className="gradient-text">Our Services</h2>
        <div className="services-grid">

            {/* 1️⃣ Influencer Campaigns */}
            <div className="service-card fade-in">
            <div className="service-icon">
                <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="s1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#6366f1" }} />
                    <stop offset="100%" style={{ stopColor: "#06b6d4" }} />
                    </linearGradient>
                </defs>
                <circle cx="32" cy="32" r="30" fill="url(#s1)" />
                <path d="M20 36h24v8H20zM28 20h8v16h-8z" fill="none" stroke="white" strokeWidth="2" />
                </svg>
            </div>
            <h3>Influencer Campaigns</h3>
            <p>Design and execute influencer campaigns that align perfectly with your brand’s goals and audience.</p>
            </div>

            {/* 2️⃣ Brand Strategy */}
            <div className="service-card fade-in">
            <div className="service-icon">
                <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="s2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#ec4899" }} />
                    <stop offset="100%" style={{ stopColor: "#6366f1" }} />
                    </linearGradient>
                </defs>
                <rect x="8" y="8" width="48" height="48" fill="url(#s2)" rx="8" />
                <circle cx="32" cy="32" r="10" fill="none" stroke="white" strokeWidth="2" />
                <circle cx="32" cy="32" r="4" fill="white" />
                <line x1="32" y1="12" x2="32" y2="18" stroke="white" strokeWidth="2" />
                <line x1="32" y1="46" x2="32" y2="52" stroke="white" strokeWidth="2" />
                <line x1="12" y1="32" x2="18" y2="32" stroke="white" strokeWidth="2" />
                <line x1="46" y1="32" x2="52" y2="32" stroke="white" strokeWidth="2" />
                </svg>
            </div>
            <h3>Brand Strategy</h3>
            <p>Build a cohesive and compelling brand narrative that sets you apart in the digital landscape.</p>
            </div>

            {/* 3️⃣ Analytics & Reporting */}
            <div className="service-card fade-in">
            <div className="service-icon">
                <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="s3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#06b6d4" }} />
                    <stop offset="100%" style={{ stopColor: "#ec4899" }} />
                    </linearGradient>
                </defs>
                <rect x="8" y="8" width="48" height="48" fill="url(#s3)" rx="6" />
                <polyline points="20,38 28,46 44,26" fill="none" stroke="white" strokeWidth="2.5" />
                </svg>
            </div>
            <h3>Analytics & Reporting</h3>
            <p>Track real-time performance and measure ROI with detailed analytics and transparent reporting.</p>
            </div>

            {/* 4️⃣ Creative Production */}
            <div className="service-card fade-in">
            <div className="service-icon">
                <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="s4" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#6366f1" }} />
                    <stop offset="100%" style={{ stopColor: "#ec4899" }} />
                    </linearGradient>
                </defs>
                <circle cx="32" cy="32" r="28" fill="url(#s4)" />
                <path d="M24 40l8-16 8 16M24 40h16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            <h3>Creative Production</h3>
            <p>From concept to content, our creative team ensures your message captures attention and drives engagement.</p>
            </div>

            {/* 5️⃣ Social Media Management */}
            <div className="service-card fade-in">
            <div className="service-icon">
                <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="s5" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#22c55e" }} />
                    <stop offset="100%" style={{ stopColor: "#06b6d4" }} />
                    </linearGradient>
                </defs>
                <circle cx="32" cy="32" r="30" fill="url(#s5)" />
                <path d="M20 32h24M32 20v24" stroke="white" strokeWidth="2.5" />
                </svg>
            </div>
            <h3>Social Media Management</h3>
            <p>Manage, grow, and engage your online audience with consistent and authentic social media storytelling.</p>
            </div>

            {/* 6️⃣ Paid Ad Campaigns */}
            <div className="service-card fade-in">
            <div className="service-icon">
                <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="s6" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#f97316" }} />
                    <stop offset="100%" style={{ stopColor: "#ec4899" }} />
                    </linearGradient>
                </defs>
                <rect x="8" y="8" width="48" height="48" fill="url(#s6)" rx="8" />
                <polygon points="26,20 46,32 26,44" fill="white" />
                </svg>
            </div>
            <h3>Paid Ad Campaigns</h3>
            <p>Amplify your reach and conversions with data-driven ad campaigns tailored for measurable success.</p>
            </div>

        </div>
        </section>



      {/* ✅ TESTIMONIALS SECTION */}
      <section id="testimonials">
        <h2>What Our Clients Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card fade-in">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p className="testimonial-text">
              "One Bird Agency transformed our brand visibility. The influencer
              matches were spot-on, and the results exceeded our expectations by
              300%."
            </p>
            <p className="testimonial-author">Priya Sharma - E-commerce Director</p>
          </div>
          <div className="testimonial-card fade-in">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p className="testimonial-text">
              "Professional, creative, and results-driven. Their team understood
              our brand vision immediately and delivered exceptional campaigns."
            </p>
            <p className="testimonial-author">Arjun Desai - Marketing Manager</p>
          </div>
          <div className="testimonial-card fade-in">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p className="testimonial-text">
              "The analytics dashboard is incredible. We can see exactly where
              our budget goes and what impact each influencer brings to our
              campaigns."
            </p>
            <p className="testimonial-author">Neha Gupta - Brand Strategist</p>
          </div>
        </div>
      </section>

      {/* ✅ COMMUNITY SECTION */}
      <section id="community">
    <h2>Why Join Our Community</h2>
    <div className="community-grid">
        <div className="community-card fade-in">
        <div className="community-icon">
            <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="c1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#6366f1" }} />
                <stop offset="100%" style={{ stopColor: "#ec4899" }} />
                </linearGradient>
            </defs>
            <rect x="8" y="8" width="48" height="48" fill="url(#c1)" rx="4" />
            <polygon
                points="32,14 38,28 52,28 42,36 46,50 32,42 18,50 22,36 12,28 26,28"
                fill="white"
            />
            </svg>
        </div>
        <h3>Exclusive Access</h3>
        <p>
            Get early access to top-tier influencers and premium networking
            opportunities with industry leaders.
        </p>
        </div>

        <div className="community-card fade-in">
        <div className="community-icon">
            <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="c2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#ec4899" }} />
                <stop offset="100%" style={{ stopColor: "#06b6d4" }} />
                </linearGradient>
            </defs>
            <rect x="8" y="8" width="48" height="48" fill="url(#c2)" rx="4" />
            <path
                d="M32 14 L40 26 L52 28 L44 36 L46 50 L32 44 L18 50 L20 36 L12 28 L24 26 Z"
                fill="none"
                stroke="white"
                strokeWidth="2"
            />
            <path
                d="M32 18 L37 27 L46 28 L39 34 L41 45 L32 40 L23 45 L25 34 L18 28 L27 27 Z"
                fill="white"
            />
            </svg>
        </div>
        <h3>Growth Acceleration</h3>
        <p>
            Scale your brand exponentially with our proven strategies and dedicated
            community support.
        </p>
        </div>

        <div className="community-card fade-in">
        <div className="community-icon">
            <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="c3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#06b6d4" }} />
                <stop offset="100%" style={{ stopColor: "#6366f1" }} />
                </linearGradient>
            </defs>
            <rect x="8" y="8" width="48" height="48" fill="url(#c3)" rx="4" />
            <rect
                x="14"
                y="16"
                width="36"
                height="32"
                fill="none"
                stroke="white"
                strokeWidth="2"
                rx="2"
            />
            <line
                x1="18"
                y1="24"
                x2="46"
                y2="24"
                stroke="white"
                strokeWidth="1.5"
            />
            <line
                x1="18"
                y1="32"
                x2="46"
                y2="32"
                stroke="white"
                strokeWidth="1.5"
            />
            <line
                x1="18"
                y1="40"
                x2="30"
                y2="40"
                stroke="white"
                strokeWidth="1.5"
            />
            </svg>
        </div>
        <h3>Learning & Development</h3>
        <p>
            Access workshops, webinars, and training from industry experts to stay
            ahead of marketing trends.
        </p>
        </div>

        <div className="community-card fade-in">
        <div className="community-icon">
            <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="c4" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#6366f1" }} />
                <stop offset="100%" style={{ stopColor: "#06b6d4" }} />
                </linearGradient>
            </defs>
            <rect x="8" y="8" width="48" height="48" fill="url(#c4)" rx="4" />
            <circle
                cx="20"
                cy="28"
                r="6"
                fill="none"
                stroke="white"
                strokeWidth="2"
            />
            <circle
                cx="44"
                cy="28"
                r="6"
                fill="none"
                stroke="white"
                strokeWidth="2"
            />
            <path d="M26 28 L38 28" stroke="white" strokeWidth="2" />
            <circle
                cx="32"
                cy="44"
                r="6"
                fill="none"
                stroke="white"
                strokeWidth="2"
            />
            <path d="M32 34 L32 38" stroke="white" strokeWidth="2" />
            </svg>
        </div>
        <h3>Networking Events</h3>
        <p>
            Connect with brands, influencers, and marketing professionals in our
            vibrant community ecosystem.
        </p>
        </div>
    </div>

    <div style={{ textAlign: "center", marginTop: "3rem" }}>
        
        <Link to="/request" >
        <button className="login-button" style={{ padding: "1.8rem 4rem", fontSize: "1.4rem" }} >
        Join the Community
        </button>
        </Link>
        
    </div>
        </section>


      {/* ✅ ABOUT SECTION */}
      <section id="about">
  <h2>About One Bird Agency</h2>
  <div className="about-content">
    <div className="about-text fade-in">
      <h3>We're Redefining Influencer Marketing</h3>
      <p>
        One Bird Agency is a forward-thinking influencer marketing agency
        dedicated to creating authentic connections between brands and
        influencers.
      </p>
      <p>
        With a team of creative strategists, data analysts, and industry
        veterans, we've successfully launched over 500+ campaigns that generated
        millions in revenue for our clients.
      </p>
      <p>
        Our mission is simple: help brands tell their story through the voices
        that matter most to their audience.
      </p>

      <div className="stats">
        <div className="stat">
          <div className="stat-number">500+</div>
          <div className="stat-label">Campaigns</div>
        </div>
        <div className="stat">
          <div className="stat-number">2M+</div>
          <div className="stat-label">Engagement</div>
        </div>
        <div className="stat">
          <div className="stat-number">98%</div>
          <div className="stat-label">Satisfaction</div>
        </div>
      </div>
    </div>

    <div className="about-image fade-in">
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="aboutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#6366f1", stopOpacity: 0.2 }} />
            <stop offset="100%" style={{ stopColor: "#06b6d4", stopOpacity: 0.2 }} />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#aboutGrad)" rx="10" />
        <circle
          cx="100"
          cy="80"
          r="40"
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
          opacity="0.6"
        />
        <circle
          cx="100"
          cy="80"
          r="30"
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
          opacity="0.4"
        />
        <rect
          x="200"
          y="40"
          width="120"
          height="120"
          fill="none"
          stroke="#ec4899"
          strokeWidth="2"
          opacity="0.6"
          rx="10"
        />
        <rect
          x="215"
          y="55"
          width="90"
          height="90"
          fill="none"
          stroke="#ec4899"
          strokeWidth="2"
          opacity="0.4"
          rx="8"
        />
        <line
          x1="140"
          y1="80"
          x2="200"
          y2="100"
          stroke="#06b6d4"
          strokeWidth="2"
          opacity="0.5"
        />
        <line
          x1="260"
          y1="160"
          x2="280"
          y2="220"
          stroke="#6366f1"
          strokeWidth="2"
          opacity="0.5"
        />
        <circle cx="260" cy="100" r="5" fill="#ec4899" opacity="0.7" />
        <circle cx="80" cy="200" r="5" fill="#06b6d4" opacity="0.7" />
        <circle cx="320" cy="240" r="5" fill="#6366f1" opacity="0.7" />
      </svg>
    </div>
  </div>
    </section>


      {/* ✅ CONTACT SECTION */}
    <section id="contact">
  <h2>Get In Touch</h2>
  <div className="contact-content">
    <div className="contact-info">
      <div className="contact-item fade-in">
        <div className="contact-icon">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"
              fill="white"
            />
            <polyline
              points="22,6 12,13 2,6"
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="contact-text">
          <h4>Email</h4>
          <a href="mailto:patelruhi2809@gmail.com" className="contact-link">
            patelruhi2809@gmail.com
          </a>
        </div>
      </div>

      <div className="contact-item fade-in">
        <div className="contact-icon">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M17.92 7.02C17.45 6.18 16.51 5.55 15.46 5.55c-2.64 0-4.78 3.48-4.78 3.48s-2.14-3.48-4.78-3.48c-1.05 0-1.99.63-2.46 1.47C2.13 8.46 1 10.52 1 12s1.13 3.54 2.64 4.88c.46.84 1.4 1.47 2.46 1.47 2.64 0 4.78-3.48 4.78-3.48s2.14 3.48 4.78 3.48c1.05 0 1.99-.63 2.46-1.47 1.51-1.34 2.64-3.4 2.64-4.88S19.43 8.46 17.92 7.02z"
              fill="white"
            />
          </svg>
        </div>
        <div className="contact-text">
          <h4>Phone</h4>
          <a href="tel:+919372873903" className="contact-link">
            +91 9372873903
          </a>
        </div>
      </div>

      <div className="contact-item fade-in">
        <div className="contact-icon">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
              fill="white"
            />
          </svg>
        </div>
        <div className="contact-text">
          <h4>Location</h4>
          <p>Malad(W), Mumbai, Maharashtra</p>
        </div>
      </div>

      <div className="social-links fade-in">
        <a href="https://www.facebook.com" className="social-link" title="Facebook">
          f
        </a>
        <a
          href="https://x.com/ruhi_1326?t=LCbC_rjZtxD10eKROdtBNQ&s=09"
          className="social-link"
          title="Twitter"
        >
          𝕏
        </a>
        <a
          href="https://www.linkedin.com/in/hinal-patel-ab2006220?utm_source=share_via&utm_content=profile&utm_medium=member_android"
          className="social-link"
          title="LinkedIn"
        >
          in
        </a>
        <a
          href="https://www.instagram.com/hinal_1326?igsh=a203OHd3NGJhOGJw"
          className="social-link"
          title="Instagram"
        >
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "20px", height: "20px", fill: "white" }}
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" />
          </svg>
        </a>
      </div>
    </div>

    <div className="contact-image fade-in">
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="contactGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#ec4899", stopOpacity: 0.2 }} />
            <stop offset="100%" style={{ stopColor: "#06b6d4", stopOpacity: 0.2 }} />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#contactGrad)" rx="10" />
        <rect x="50" y="50" width="140" height="60" rx="15" fill="#6366f1" opacity="0.7" />
        <polygon points="50,100 40,115 50,110" fill="#6366f1" opacity="0.7" />
        <text x="70" y="85" fontSize="24" fill="white" opacity="0.8">
          Hello!
        </text>

        <rect x="210" y="110" width="140" height="60" rx="15" fill="#ec4899" opacity="0.7" />
        <polygon points="350,160 360,175 350,170" fill="#ec4899" opacity="0.7" />
        <text x="230" y="145" fontSize="24" fill="white" opacity="0.8">
          Great work!
        </text>

        <rect x="80" y="190" width="140" height="60" rx="15" fill="#06b6d4" opacity="0.7" />
        <polygon points="80,240 70,255 80,250" fill="#06b6d4" opacity="0.7" />
        <text x="100" y="225" fontSize="24" fill="white" opacity="0.8">
          Thanks!
        </text>
      </svg>
    </div>
  </div>
    </section>


      {/* ✅ FOOTER */}
      <footer>
        <p>
          &copy; 2025 One Bird Agency. All rights reserved. | Bringing brands and
          influencers together.
        </p>
      </footer>
    </>
  );
};

export default Landing;
