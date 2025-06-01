// HomePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import useScrollReveal from './hooks/useScrollReveal';

// Import icons from lucide-react
import { ChevronRight, Sparkles, Shirt, Crown, User, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Clock, Wand2, Loader2, Star, Menu } from 'lucide-react'; // Added Loader2 for loading state

// Import Firebase
import { db } from './firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

function HomePage() {
  const [menCategories, setMenCategories] = useState([]);
  const [womenCategories, setWomenCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productFetchError, setProductFetchError] = useState('');

  // Store Locations Data - Now fetched dynamically
  const [storeLocations, setStoreLocations] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [storeError, setStoreError] = useState('');

  // NEW STATE: State for modal visibility
  const [showStoreModal, setShowStoreModal] = useState(true);
  // NEW STATE for scroll effect
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Effect for scroll to add/remove 'scrolled' class
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) { // Adjust this value as needed
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  // Data for Testimonials (can also be fetched from Firebase)
  const testimonials = [
    {
      quote: "Renting from them was a breeze! The suit was perfect for my event, and the quality was exceptional. Highly recommend for any occasion!",
      author: "Rahul Sharma",
      city: "Camp, Pune",
      rating: 5 // Add a rating
    },
    {
      quote: "My pre-wedding gown was stunning and fit perfectly. Saved me so much money, and the process was seamless. Will definitely use again!",
      author: "Priya Singh",
      city: "Wakad, Pune",
      rating: 5
    },
    {
      quote: "Excellent collection and very professional service. Found the ideal sherwani for my brother's wedding. Their team was very helpful.",
      author: "Amit Kumar",
      city: "Nagpur",
      rating: 4
    },
    {
      quote: "The dress I rented for my friend's reception was beautiful and in perfect condition. Great value for money!",
      author: "Sneha Reddy",
      city: "Koregaon Park, Pune",
      rating: 5
    },
    {
      quote: "Very easy process from selection to return. The outfit was exactly as described and suited my event perfectly.",
      author: "John Doe",
      city: "Baner, Pune",
      rating: 4
    }
  ];


  // State for the image slider
  const [currentSlide, setCurrentSlide] = useState(0);
  // State for mobile menu open/close

  // State for Style Advisor feature
  const [eventDescription, setEventDescription] = useState('');
  const [styleAdvice, setStyleAdvice] = useState('');
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [adviceError, setAdviceError] = useState('');

  // --- Firebase Data Fetching for Categories ---
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      setCategoryError('');
      try {
        const menQuery = query(collection(db, 'menCategories'), orderBy('order'));
        const menSnapshot = await getDocs(menQuery);
        const menData = menSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMenCategories(menData);

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
  }, []);

  // --- Firebase Data Fetching for Stores ---
  useEffect(() => {
    const fetchStores = async () => {
      setLoadingStores(true);
      setStoreError('');
      try {
        const storesCollectionRef = collection(db, 'filterOptions', 'stores', 'list');
        const storeSnapshot = await getDocs(storesCollectionRef);
        // Assuming each store document has a 'name' field and potentially an 'image' field
        const fetchedStores = storeSnapshot.docs.map(doc => ({ id: doc.id, name: doc.id, image: doc.data().imageUrl || `https://placehold.co/1200x600/404040/e0e0e0?text=${doc.id.replace(/\s/g, '+')}` }));
        setStoreLocations(fetchedStores);
      } catch (error) {
        console.error("Error fetching store locations:", error);
        setStoreError("Failed to load store locations. Please try again.");
      } finally {
        setLoadingStores(false);
      }
    };

    fetchStores();
  }, []); // Run once on component mount

  // Auto-slide functionality for store images
  useEffect(() => {
    if (storeLocations.length > 0) { // Only start slider if stores are loaded
      const slideInterval = setInterval(() => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % storeLocations.length);
      }, 5000);

      return () => clearInterval(slideInterval);
    }
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
      {/* Store Selection Modal */}
      {showStoreModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Welcome to Dress On Rent !</h2>
            <p className="modal-description">Please select your preferred store location to start Browse our collections.</p>
            {loadingStores ? (
              <div className="modal-loading">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <p>Loading stores...</p>
              </div>
            ) : storeError ? (
              <p className="modal-error">{storeError}</p>
            ) : (
              <div className="modal-store-options">
                {storeLocations.map((store) => (
                  <button
                    key={store.id}
                    className="btn btn-primary modal-store-button"
                    onClick={() => {
                      localStorage.setItem('selectedStore', store.name);
                      setShowStoreModal(false);
                    }}
                  >
                    <div className="modal-button-icon-bg">
                      <Crown size={64} className="modal-button-icon" />
                    </div>
                    <span className="modal-button-text">{store.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <a href="#" className="header-logo animate-pulse-custom">
            Dress On<span> Rent</span> {/* Added span for accent color */}
          </a>
          <div className="header-nav-wrapper">
            <nav className="desktop-nav">
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
              {/* New Call to Action Button */}
              <a href="#men" className="cta-button">
                Rent Now
                <ChevronRight size={18} className="icon-right" />
              </a>
            </nav>
            <button
              className={`mobile-menu-button animate-slow-spin ${isMobileMenuOpen ? 'rotate-90' : ''}`}
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
            >
              {/* Replaced SVG with Lucide icon */}
              <Menu size={28} />
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <nav className="mobile-nav">
            <ul className="mobile-nav-list">
              <li><a href="#men" className="mobile-nav-item" onClick={toggleMobileMenu}>Men</a></li>
              <li><a href="#women" className="mobile-nav-item" onClick={toggleMobileMenu}>Women</a></li>
              <li><a href="#stores-location" className="mobile-nav-item" onClick={toggleMobileMenu}>Stores Location</a></li>
              <li><a href="#contact" className="mobile-nav-item" onClick={toggleMobileMenu}>Contact Us</a></li>
              <li><a href="#rent-with-us" className="mobile-nav-item" onClick={toggleMobileMenu}>Rent with Us</a></li>
              <li><a href="#franchise" className="mobile-nav-item" onClick={toggleMobileMenu}>Franchise</a></li>
              {/* Mobile CTA Button if desired, or just direct them to sections */}
              <li>
                <a href="#men" className="mobile-nav-item" onClick={toggleMobileMenu} style={{ color: '#db2777', fontWeight: 'bold' }}>
                  Rent Now
                </a>
              </li>
            </ul>
          </nav>
        )}
      </header>
      {/* Hero Section */}
      {/* Hero Section - Alternative Design */}
      {/* Hero Section - Split Layout Design */}
      {/* Hero Section - Ultimate Design with Background Image */}
      <section className="hero-section-ultimate">
        <div className="hero-ultimate-background"></div> {/* This will hold the background image and overlay */}
        <div className="container hero-ultimate-content">

          <p className="hero-ultimate-description animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Step into elegance without compromise. Rent the finest designer wear for your unforgettable moments.
          </p>
          <div className="hero-ultimate-buttons animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Link to="#women" className="cta-button hero-ultimate-button-women">
              Explore Women's Styles
              <ChevronRight size={18} className="icon-right" />
            </Link>
            <Link to="#men" className="cta-button hero-ultimate-button-men">
              Explore Men's Styles
              <ChevronRight size={18} className="icon-right" />
            </Link>
          </div>
        </div>
      </section>
      {/* Store Locations Section */}
      <section id="stores-location"
        ref={storesRef}
        className={`section bg-white ${storesIsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
        <div className="container text-center">
          <h2 className="section-title">Our Stores</h2>
          {loadingStores ? (
            <div className="message-container loading">
              <Loader2 size={48} className="animate-spin text-blue-500" />
              <p className="message-text">Loading stores...</p>
            </div>
          ) : storeError ? (
            <p className="message-container error">{storeError}</p>
          ) : storeLocations.length === 0 ? (
            <p className="message-container no-products">No store locations found.</p>
          ) : (
            <div className="grid-3-col">
              {storeLocations.map((store) => (
                <div key={store.id} className="store-card">
                  <img
                    src={store.image}
                    alt={store.name}
                    className="store-card-image"
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x300/cccccc/333333?text=${store.name}`; }}
                  />
                  <h3 className="card-title">{store.name}</h3>

                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Store Image Slider */}
      <section className={`section bg-neutral-100 overflow-hidden ${sliderIsVisible ? 'animate-fade-in' : 'opacity-0'}`} ref={sliderRef}>
        <div className="container">
          <h2 className="section-title">A Glimpse of Our Stores</h2>
          {loadingStores ? (
            <div className="message-container loading">
              <Loader2 size={48} className="animate-spin text-blue-500" />
              <p className="message-text">Loading store images...</p>
            </div>
          ) : storeError ? (
            <p className="message-container error">{storeError}</p>
          ) : storeLocations.length === 0 ? (
            <p className="message-container no-products">No store images available.</p>
          ) : (
            <>
              <div className="slider-container">
                {storeLocations.map((store, index) => (
                  <img
                    key={store.id}
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
            </>
          )}
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
            <div className="grid-4-col">
              {menCategories.map((category) => (
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
            <div className="grid-5-col">
              {womenCategories.map((category) => (
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
      <section id="how-it-works" ref={howItWorksRef} className={`section bg-white ${howItWorksIsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '0.1s' }}>
        <div className="container text-center">
          <h2 className="section-title">How It Works</h2>
          <div className="grid-3-col">
            <div className={`how-it-works-step-card ${howItWorksIsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '0.1s' }}>
              <div className="how-it-works-icon-wrapper">
                <Sparkles size={36} className="how-it-works-icon" />
              </div>
              <h3 className="card-title">1. Choose Your Outfit</h3>
              <p className="step-description">Browse our extensive collection of designer dresses and suits for all occasions.</p>
            </div>
            <div className={`how-it-works-step-card ${howItWorksIsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '0.2s' }}>
              <div className="how-it-works-icon-wrapper">
                <Shirt size={36} className="how-it-works-icon" />
              </div>
              <h3 className="card-title">2. Select Dates & Size</h3>
              <p className="step-description">Pick your rental period and find your perfect fit with our detailed size guides.</p>
            </div>
            <div className={`how-it-works-step-card ${howItWorksIsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '0.3s' }}>
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
        <div className="container">
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
                    <path className="spinner-path-2" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
              <div key={index} className="testimonial-card animate-pop-in" style={{ transitionDelay: `${index * 0.1}s` }}>
                <p className="testimonial-quote">"{testimonial.quote}"</p>
                {/* Display stars for rating */}
                <div className="testimonial-rating">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < testimonial.rating ? '#FFD700' : 'none'} // Gold for filled stars
                      stroke={i < testimonial.rating ? '#FFD700' : '#d1d5db'} // Stroke color
                      className="inline-block"
                    />
                  ))}
                </div>
                <p className="testimonial-author">{testimonial.author}</p>
                <p className="testimonial-city">{testimonial.city}</p>
              </div>
            ))}
          </div>
          {/* Add a link to your Google My Business reviews */}
          <div className="mt-8 text-center">
            <a
              href="https://www.google.com/maps/place/DOR+-+Dress+On+Rent/@18.510647,73.8701188,17z/data=!4m8!3m7!1s0x3bc2bf5a58dc7161:0x19aab6f082d33f00!8m2!3d18.510647!4d73.8726937!9m1!1b1!16s%2Fg%2F11f79pz3t4?entry=ttu&g_ep=EgoyMDI1MDUyOC4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary animate-button-press"
            >
              Read More Reviews on Google <ChevronRight size={16} className="inline-block ml-1" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="footer-container">
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

          <div className="footer-col">
            <h3 className="footer-heading">Contact Us</h3>
            <ul className="footer-list">
              <li className="contact-item"><Mail size={18} className="icon-mr" /> info@rentmydress.com</li>
              <li className="contact-item"><Phone size={18} className="icon-mr" /> +91 98765 43210</li>
              <li className="contact-item align-start"><MapPin size={18} className="icon-mr mt-1" />
                <address className="address-text">
                  Our Stores:<br />
                  {loadingStores ? 'Loading...' : storeError ? 'Error loading stores' : storeLocations.map(store => store.name).join(', ')}
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