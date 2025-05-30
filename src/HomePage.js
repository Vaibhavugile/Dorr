import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import the Link component
import './HomePage.css';
import useScrollReveal from './hooks/useScrollReveal'; // Import the custom hook

// Import icons from lucide-react
import { ChevronRight, Sparkles, Shirt, Crown, User, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Clock, Wand2 } from 'lucide-react';

// Import Firebase
import { db } from './firebaseConfig'; // Import your initialized Firestore instance
import { collection, getDocs, query, orderBy } from 'firebase/firestore'; // Import necessary Firestore functions

function HomePage() {
  // State for categories fetched from Firebase
  const [menCategories, setMenCategories] = useState([]);
  const [womenCategories, setWomenCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState('');
 const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productFetchError, setProductFetchError] = useState('');
  // Data for Testimonials (can also be fetched from Firebase)
  const testimonials = [
    {
      quote: "Renting from them was a breeze! The suit was perfect for my event, and the quality was exceptional.",
      author: "Rahul Sharma",
      city: "Camp, Pune"
    },
    {
      quote: "My pre-wedding gown was stunning and fit perfectly. Saved me so much money, and the process was seamless.",
      author: "Priya Singh",
      city: "Wakad, Pune"
    },
    {
      quote: "Excellent collection and very professional service. Found the ideal sherwani for my brother's wedding.",
      author: "Amit Kumar",
      city: "Nagpur"
    }
  ];

  // Store Locations Data - Updated for names only on cards and specific city images for slider
  const storeLocations = [
    {
      name: 'Camp, Pune',
      image: 'https://placehold.co/1200x600/404040/e0e0e0?text=Shaniwar+Wada,+Pune' // Shaniwar Wada (Dark Gray)
    },
    {
      name: 'Wakad, Pune',
      image: 'https://placehold.co/1200x600/262626/d0d0d0?text=Hinjewadi+IT+Park,+Pune' // Hinjewadi IT Park (Darker Gray)
    },
    {
      name: 'Nagpur',
      image: 'https://placehold.co/1200x600/505050/f5f5f5?text=Deekshabhoomi,+Nagpur' // Deekshabhoomi (Medium Gray)
    },
  ];

  // State for the image slider
  const [currentSlide, setCurrentSlide] = useState(0);
  // State for mobile menu open/close
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State for Style Advisor feature
  const [eventDescription, setEventDescription] = useState('');
  const [styleAdvice, setStyleAdvice] = useState('');
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [adviceError, setAdviceError] = useState('');

  // --- Firebase Data Fetching ---
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      setCategoryError('');
      try {
        // Fetch Men's Categories
        const menQuery = query(collection(db, 'menCategories'), orderBy('order'));
        const menSnapshot = await getDocs(menQuery);
        const menData = menSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMenCategories(menData);

        // Fetch Women's Categories
        const womenQuery = query(collection(db, 'womenCategories'), orderBy('order'));
        const womenSnapshot = await getDocs(womenQuery);
        const womenData = womenSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWomenCategories(womenData);

      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategoryError("Failed to load categories. Please try again later.");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []); // Empty dependency array means this runs once on mount

  // Auto-slide functionality for store images
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % storeLocations.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(slideInterval); // Clear interval on component unmount
  }, [storeLocations.length]);

  // Function to handle dot clicks for slider
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Function to toggle mobile menu visibility
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Function to get style advice from Gemini API
  const getStyleAdvice = async () => {
    if (!eventDescription.trim()) {
      setAdviceError('Please describe your event to get style advice.');
      return;
    }

    setIsLoadingAdvice(true);
    setAdviceError('');
    setStyleAdvice('');

    try {
      let chatHistory = [];
      const prompt = `Given the event: "${eventDescription}", suggest 3-5 suitable dress or suit styles from a rental perspective for a dress rental business. Focus on popular categories like Suits, Blazers, Sherwani, Jodhpuri for men, and Bridal Gowns, Sangeet Gowns, Pre-Wedding Gowns, Maternity Gowns, Bridal Maternity Gowns for women. Provide short, concise suggestions.`;
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });

      const payload = { contents: chatHistory };
      // API key is handled by the Canvas environment for gemini-2.0-flash
      const apiKey = "AIzaSyB8Qs1DCfin_qFAoo19CDAe8I3qnkmaj0U";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setStyleAdvice(text);
      } else {
        setAdviceError('Could not get style advice. Please try again.');
        console.error('Gemini API response structure unexpected:', result);
      }
    } catch (error) {
      setAdviceError('Failed to fetch style advice. Please check your network connection.');
      console.error('Error fetching style advice:', error);
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  // --- Scroll Reveal Hooks for each section ---
  const [storesRef, storesIsVisible] = useScrollReveal({ threshold: 0.2 });
  const [sliderRef, sliderIsVisible] = useScrollReveal({ threshold: 0.2 });
  const [menRef, menIsVisible] = useScrollReveal({ threshold: 0.2 });
  const [womenRef, womenIsVisible] = useScrollReveal({ threshold: 0.2 });
  const [howItWorksRef, howItWorksIsVisible] = useScrollReveal({ threshold: 0.3 });
  const [styleAdvisorRef, styleAdvisorIsVisible] = useScrollReveal({ threshold: 0.2 });
  const [aboutUsRef, aboutUsIsVisible] = useScrollReveal({ threshold: 0.2 });
  const [testimonialsRef, testimonialsIsVisible] = useScrollReveal({ threshold: 0.2 });


  return (
    <div className="home-page">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          {/* Logo on the left with continuous pulse animation */}
          <a href="#" className="header-logo animate-pulse-custom">
            RentMyDress
          </a>

          {/* Navigation links and hamburger icon on the right */}
          <div className="header-nav-wrapper">
            <nav className="desktop-nav">
              {/* Navigation Links with Hover Underline */}
              <a href="#men" className="nav-link group">
                Men
                <span className="nav-link-underline"></span>
              </a>
              <a href="#women" className="nav-link group">
                Women
                <span className="nav-link-underline"></span>
              </a>
              <a href="#stores-location" className="nav-link group">
                Stores Location
                <span className="nav-link-underline"></span>
              </a>
              <a href="#contact" className="nav-link group">
                Contact Us
                <span className="nav-link-underline"></span>
              </a>
              <a href="#rent-with-us" className="nav-link group">
                Rent with Us
                <span className="nav-link-underline"></span>
              </a>
              <a href="#franchise" className="nav-link group">
                Franchise
                <span className="nav-link-underline"></span>
              </a>
            </nav>
            {/* Mobile Menu Button (Hamburger) with rotation animation */}
            <button
              className={`mobile-menu-button animate-slow-spin ${isMobileMenuOpen ? 'rotate-90' : ''}`}
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="icon-size" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="mobile-nav">
            <ul className="mobile-nav-list">
              <li><a href="#men" className="mobile-nav-item" onClick={toggleMobileMenu}>Men</a></li>
              <li><a href="#women" className="mobile-nav-item" onClick={toggleMobileMenu}>Women</a></li>
              <li><a href="#stores-location" className="mobile-nav-item" onClick={toggleMobileMenu}>Stores Location</a></li>
              <li><a href="#contact" className="mobile-nav-item" onClick={toggleMobileMenu}>Contact Us</a></li>
              <li><a href="#rent-with-us" className="mobile-nav-item" onClick={toggleMobileMenu}>Rent with Us</a></li>
              <li><a href="#franchise" className="mobile-nav-item" onClick={toggleMobileMenu}>Franchise</a></li>
            </ul>
          </nav>
        )}
      </header>

      {/* Store Locations Section */}
      <section id="stores-location"
        ref={storesRef}
        className={`section bg-white ${storesIsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
        <div className="container text-center">
          <h2 className="section-title">Our Stores</h2> {/* Changed title for brevity */}
          <div className="grid-3-col gap-8">
            {storeLocations.map((store, index) => (
              <div key={index} className="store-card">
                <img
                  src={store.image}
                  alt={store.name}
                  className="store-card-image"
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x300/cccccc/333333?text=${store.name}`; }}
                />
                <h3 className="card-title">{store.name}</h3>
                <button className="btn btn-primary mt-4">
                  View Map
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Store Image Slider */}
      <section className={`section bg-neutral-100 overflow-hidden ${sliderIsVisible ? 'animate-fade-in' : 'opacity-0'}`} ref={sliderRef}>
        <div className="container">
          <h2 className="section-title">A Glimpse of Our Stores</h2>
          <div className="slider-container">
            {storeLocations.map((store, index) => (
              <img
                key={index}
                src={store.image}
                alt={store.name}
                className={`slider-image ${index === currentSlide ? 'active-slide' : 'hidden-slide'}`}
                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/1200x600/cccccc/333333?text=${store.name}+Store`; }}
              />
            ))}
            <div className="slider-dots">
              {storeLocations.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`dot ${index === currentSlide ? 'active-dot' : ''}`}
                  aria-label={`Go to slide ${index + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Men's Collection Section */}
      <section id="men" ref={menRef} className={`section bg-white ${menIsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
        <div className="container">
          <h2 className="section-title">Men's Collection</h2>
          <p className="section-description">
            From sharp suits to traditional sherwanis, find the ideal attire for every gentleman's occasion.
          </p>
          {loadingCategories ? (
            <p className="text-center text-gray-600">Loading men's categories...</p>
          ) : categoryError ? (
            <p className="text-center text-red-500">{categoryError}</p>
          ) : (
            <div className="grid-4-col gap-8">
              {menCategories.map((category) => (
                // Changed div to Link component for navigation
                <Link to={`/collection/men/${category.name}`} key={category.id} className="category-card animate-pop-in">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="category-card-image"
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x300/cccccc/333333?text=${category.name}`; }}
                  />
                  <div className="category-card-content">
                    <h3 className="card-title">{category.name}</h3>
                    <p className="card-subtitle">Explore Styles</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Women's Collection Section */}
      <section id="women" ref={womenRef} className={`section bg-neutral-100 ${womenIsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
        <div className="container">
          <h2 className="section-title">Women's Collection</h2>
          <p className="section-description">
            Dazzle in our exquisite range of gowns, perfect for bridal, pre-wedding, maternity, and special occasions.
          </p>
          {loadingCategories ? (
            <p className="text-center text-gray-600">Loading women's categories...</p>
          ) : categoryError ? (
            <p className="text-center text-red-500">{categoryError}</p>
          ) : (
            <div className="grid-5-col gap-8">
              {womenCategories.map((category) => (
                // Changed div to Link component for navigation
                <Link to={`/collection/women/${category.name}`} key={category.id} className="category-card alt-card animate-pop-in">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="category-card-image"
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x300/cccccc/333333?text=${category.name}`; }}
                  />
                  <div className="category-card-content">
                    <h3 className="card-title">{category.name}</h3>
                    <p className="card-subtitle">Discover More</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" ref={howItWorksRef} className={`section bg-white ${howItWorksIsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
        <div className="container text-center">
          <h2 className="section-title">How It Works</h2>
          <div className="grid-3-col gap-12">
            {/* Added scroll-reveal-delay and fade-in-up for sequential animation */}
            <div className={`how-it-works-step-card ${howItWorksIsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`} style={{transitionDelay: '0.1s'}}>
              <div className="how-it-works-icon-wrapper">
                <Sparkles size={36} className="how-it-works-icon" />
              </div>
              <h3 className="card-title">1. Choose Your Outfit</h3>
              <p className="step-description">Browse our extensive collection of designer dresses and suits for all occasions.</p>
            </div>
            <div className={`how-it-works-step-card ${howItWorksIsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`} style={{transitionDelay: '0.2s'}}>
              <div className="how-it-works-icon-wrapper">
                <Shirt size={36} className="how-it-works-icon" />
              </div>
              <h3 className="card-title">2. Select Dates & Size</h3>
              <p className="step-description">Pick your rental period and find your perfect fit with our detailed size guides.</p>
            </div>
            <div className={`how-it-works-step-card ${howItWorksIsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`} style={{transitionDelay: '0.3s'}}>
              <div className="how-it-works-icon-wrapper">
                <Crown size={36} className="how-it-works-icon" />
              </div>
              <h3 className="card-title">3. Rock Your Look & Return</h3>
              <p className="step-description">Enjoy your event! We handle the cleaning when you return the outfit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ✨ Style Advisor Section (Gemini API Integration) ✨ */}
      <section ref={styleAdvisorRef} className={`section bg-neutral-100 text-center ${styleAdvisorIsVisible ? 'animate-fade-in' : 'opacity-0'}`}>
        <div className="container max-width-3xl">
          <h2 className="section-title">✨ Get Personalized Style Advice ✨</h2>
          <p className="section-description-sub">
            Describe your event, and our AI-powered style advisor will suggest the perfect attire!
          </p>
          <div className="style-advisor-form">
            <textarea
              className="style-advisor-textarea"
              placeholder="e.g., 'A formal corporate gala dinner', 'A casual outdoor summer wedding', 'A traditional Indian festival'"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              rows="4"
            ></textarea>
            <button
              onClick={getStyleAdvice}
              disabled={isLoadingAdvice}
              className="btn btn-primary btn-lg style-advisor-button animate-button-press"
            >
              {isLoadingAdvice ? (
                <>
                  <svg className="spinner-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="spinner-path-1" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="spinner-path-2" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Getting Advice...
                </>
              ) : (
                <>
                  <Wand2 className="icon-mr" size={20} />
                  Get Style Advice
                </>
              )}
            </button>
            {adviceError && (
              <p className="error-message">{adviceError}</p>
            )}
            {styleAdvice && (
              <div className="style-advice-output">
                <h3 className="output-title">Our Recommendation:</h3>
                <p className="output-text">{styleAdvice}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about-us" ref={aboutUsRef} className={`section bg-neutral-100 ${aboutUsIsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
        <div className="container max-width-3xl text-center">
          <h2 className="section-title">About RentMyDress</h2>
          <p className="section-description-sub mb-6">
            At RentMyDress, we believe in sustainable fashion without compromising on style. We offer a curated selection of high-quality, fashionable attire for both men and women, making luxury accessible for every special moment.
          </p>
          <p className="section-description-sub">
            With convenient locations in Camp, Wakad (Pune), and Nagpur, we're dedicated to providing an unparalleled rental experience, helping you look your best while being kind to your wallet and the planet.
          </p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className={`section bg-white ${testimonialsIsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
        <div className="container text-center">
          <h2 className="section-title">What Our Customers Say</h2>
          <div className="grid-3-col gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card animate-pop-in" style={{transitionDelay: `${index * 0.1}s`}}> {/* Sequential pop-in */}
                <p className="testimonial-quote">"{testimonial.quote}"</p>
                <p className="testimonial-author">{testimonial.author}</p>
                <p className="testimonial-city">{testimonial.city}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="footer-container">
          {/* About Column */}
          <div className="footer-col">
            <h3 className="footer-heading">RentMyDress</h3>
            <p className="footer-text">
              Your premier destination for high-quality dress and suit rentals. Elevate your style, sustainably and affordably.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon animate-social-pop"><Instagram size={24} /></a>
              <a href="#" className="social-icon animate-social-pop"><Facebook size={24} /></a>
              <a href="#" className="social-icon animate-social-pop"><Twitter size={24} /></a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="footer-col">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-list">
              <li><a href="#men" className="footer-link animate-footer-link-hover">Men's Collection</a></li>
              <li><a href="#women" className="footer-link animate-footer-link-hover">Women's Collection</a></li>
              <li><a href="#how-it-works" className="footer-link animate-footer-link-hover">How It Works</a></li>
              <li><a href="#about-us" className="footer-link animate-footer-link-hover">About Us</a></li>
              <li><a href="#" className="footer-link animate-footer-link-hover">FAQ</a></li>
            </ul>
          </div>

          {/* Contact Info Column */}
          <div className="footer-col">
            <h3 className="footer-heading">Contact Us</h3>
            <ul className="footer-list">
              <li className="contact-item"><Mail size={18} className="icon-mr" /> info@rentmydress.com</li>
              <li className="contact-item"><Phone size={18} className="icon-mr" /> +91 98765 43210</li>
              <li className="contact-item align-start"><MapPin size={18} className="icon-mr mt-1" />
                <address className="address-text">
                  Our Stores:<br/>
                  Camp, Pune<br/>
                  Wakad, Pune<br/>
                  Nagpur
                </address>
              </li>
            </ul>
          </div>
        </div>
        <div className="copyright">
          &copy; {new Date().getFullYear()} RentMyDress. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
