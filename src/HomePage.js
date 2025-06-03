// HomePage.js
import React, { useState, useEffect } from 'react';
import { Link,useLocation  } from 'react-router-dom';
import './HomePage.css';
import useScrollReveal from './hooks/useScrollReveal';

// Import icons from lucide-react
import { ChevronRight, Sparkles, Shirt, Crown, User, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Clock, Wand2, Loader2, Star, Menu } from 'lucide-react'; // Added Loader2 for loading state

// Import Firebase
import { db } from './firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import aboutus1 from "../src/assets/Gemini_Generated_Image_jprw1njprw1njprw.png";
import aboutus2 from "../src/assets/Gemini_Generated_Image_mjcef7mjcef7mjce.png";
// Import Helmet for SEO meta tags
import { Helmet } from 'react-helmet-async';
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
    const location = useLocation(); // Get the current location object


    useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        // Scroll smoothly to the element
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // After scrolling, remove the hash from the URL
          // Use replaceState to change the URL without adding a new entry to the browser history
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 100); // Small delay to allow scroll to initiate
      }
    }
  }, [location]); // Re-run effect when the location object (specifically the hash) changes
 // Re-run effect when the location object (specifically the hash) changes
   useEffect(() => {
    // Use setTimeout with a small delay to override browser's scroll restoration
    setTimeout(() => {
      window.scrollTo(0, 0); // Scroll to the very top (x=0, y=0)
    }, 0); // A 0ms delay moves it to the end of the current JavaScript execution queue
  }, []); 
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
      {/* SEO Optimization with React Helmet */}
    <Helmet>
      {/* Optimized Title Tag */}
      <title>DOR - Dress On Rent | Premium Lehengas, Sherwanis & Gowns in Pune & Nagpur</title>

      {/* Optimized Meta Description */}
      <meta name="description" content="Rent premium lehengas, bridal gowns, sherwanis, suits, and tuxedos from DOR in Pune & Nagpur. Your ultimate destination for dress rentals for weddings, parties & events." />

      {/* Optimized Meta Keywords (less impactful now, but good to include) */}
      <meta name="keywords" content="dress on rent Pune, dress on rent Nagpur, lehenga on rent Pune, sherwani on rent Pune, bridal lehenga on rent Pune, gown on rent Pune, suit on rent Pune, tuxedo on rent Pune, jodhpuri on rent Pune, mens ethnic wear on rent Pune, women's ethnic wear on rent Pune, luxury rentals Pune, wedding wear on rent Pune, party wear on rent Pune, lehenga on rent Nagpur, sherwani on rent Nagpur, bridal lehenga on rent Nagpur, gown on rent Nagpur, suit on rent Nagpur, tuxedo on rent Nagpur, jodhpuri on rent Nagpur, mens ethnic wear on rent Nagpur, women's ethnic wear on rent Nagpur" />

      {/* LocalBusiness Schema Markup for Pune and Nagpur locations (JSON-LD) */}
      {/* IMPORTANT: Replace all placeholder URLs, addresses, and contact info with your actual details */}
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "DOR - Dress On Rent",
            "url": "https://www.yourdorwebsite.com/", // *** REPLACE with your actual website URL ***
            "image": "https://www.yourdorwebsite.com/logo.png", // *** REPLACE with your logo URL (e.g., a high-res logo) ***
            "description": "DOR offers premium lehengas, sherwanis, suits, gowns, and bridal wear on rent in Pune & Nagpur for weddings, parties, and special events.",
            "address": [
              {
                "@type": "PostalAddress",
                "streetAddress": "Your Pune Street Address Here", // *** REPLACE with actual Pune address ***
                "addressLocality": "Pune",
                "addressRegion": "MH",
                "postalCode": "411001", // *** REPLACE with actual Pune postal code ***
                "addressCountry": "IN"
              },
              {
                "@type": "PostalAddress",
                "streetAddress": "Your Nagpur Street Address Here", // *** REPLACE with actual Nagpur address ***
                "addressLocality": "Nagpur",
                "addressRegion": "MH",
                "postalCode": "440001", // *** REPLACE with actual Nagpur postal code ***
                "addressCountry": "IN"
              }
            ],
            "telephone": "+919876543210", // *** REPLACE with your actual contact number (e.g., +919876543210) ***
            "priceRange": "$$", // Indicative price range (e.g., $, $$, $$$)
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
                ],
                "opens": "10:00", // Your opening time
                "closes": "21:00" // Your closing time
              }
            ],
            "sameAs": [
              "https://www.instagram.com/yourdorinstagram", // *** REPLACE with your Instagram URL ***
              "https://www.facebook.com/yourdorfacebook", // *** REPLACE with your Facebook URL ***
              "https://www.twitter.com/yourdortwitter" // *** REPLACE with your Twitter URL if applicable ***
            ]
          }
        `}
      </script>
    </Helmet>
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
    {/* SEO Change 1: Changed <a> to <Link> and wrapped the logo text in <h1> */}
    {/* The <h1> tag signifies this as the most important heading on the page for SEO. */}
    {/* Using <Link to="/"> ensures client-side routing and clean URL for homepage. */}
    <a href="#" className="header-logo animate-pulse-custom">
            Dress On<span> Rent</span> {/* Added span for accent color */}
          </a>
    <div className="header-nav-wrapper">
      <nav className="desktop-nav">
        {/* Navigation links are already descriptive, which is good for SEO. */}
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
        <a href="#how-it-works" className="nav-link group">
          How It Works
          <span className="nav-link-underline"></span>
        </a>
        <a href="#contact" className="nav-link group">
          Contact Us
          <span className="nav-link-underline"></span>
        </a>

        <a href="#franchise" className="nav-link group">
          Franchise
          <span className="nav-link-underline"></span>
        </a>
        {/* New Call to Action Button - Anchor text is clear */}
        <a href="#men" className="cta-button">
          Rent Now
          <ChevronRight size={18} className="icon-right" />
        </a>
      </nav>
      <button
        className={`mobile-menu-button animate-slow-spin ${isMobileMenuOpen ? 'rotate-90' : ''}`}
        onClick={toggleMobileMenu}
        aria-expanded={isMobileMenuOpen}
        // SEO Change 2: Added aria-label for accessibility for screen readers
        aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
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
            {/* SEO Change 1: Added the H1 tag for your primary heading */}
            {/* This is crucial for search engines to understand the main topic of your page. */}
            {/* The styling for this H1 is handled in the CSS section below. */}
           
            <p className="hero-ultimate-description animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Step into elegance without compromise. Rent the finest designer wear for your unforgettable moments in
                <strong className="highlight"> Pune</strong> and
                <strong className="highlight"> Nagpur</strong>. Look stunning for every occasion.
            </p>
            <div className="hero-ultimate-buttons animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Link to="/#women" className="cta-button hero-ultimate-button-women">
                    Explore Women's Styles
                    <ChevronRight size={18} className="icon-right" />
                </Link>
                <Link to="/#men" className="cta-button hero-ultimate-button-men">
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
            {/* H2 tag is already well-placed for section title */}
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
                                alt={`DOR Dress On Rent store location in ${store.name}`}
                                className="store-card-image"
                                loading="lazy"
                                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x300/cccccc/333333?text=DOR ${store.name} Store`; }}
                            />
                            {/* H3 tag is appropriate for individual store names */}
                            <h3 className="card-title">{store.name}</h3>
                            {/* If store.address is available, you might consider adding it here as well for local SEO */}
                            {/* {store.address && <p className="store-address">{store.address}</p>} */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    </section>

      {/* Store Image Slider */}
<section className={`section bg-neutral-100 overflow-hidden ${sliderIsVisible ? 'animate-fade-in' : 'opacity-0'}`} ref={sliderRef}>
        <div className="container">
            {/* H2 tag is appropriate for this section title */}
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
                               alt={`DOR Dress On Rent ${store.name} store showroom`}
                                className={`slider-image ${index === currentSlide ? 'active-slide' : 'hidden-slide'}`}
                                loading="lazy"
                                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/1200x600/cccccc/333333?text=DOR+${store.name}+Store+Image`; }}
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
            {/* H2 tag is appropriate for the section title */}
            <h2 className="section-title">Men's Collection</h2>
            <p className="section-description">
                From sharp suits and tuxedos to traditional sherwanis and ethnic wear, find the ideal attire for every gentleman's occasion. Rent premium men's fashion for weddings, parties, and events in <strong className="highlight">Pune</strong> and <strong className="highlight">Nagpur</strong>.
            </p>
            {loadingCategories ? (
                <p className="text-center text-gray-600">Loading men's categories...</p>
            ) : categoryError ? (
                <p className="text-center text-red-500">{categoryError}</p>
            ) : (
                <div className="grid-4-col">
                    {menCategories.map((category) => (
                        <Link
                            to={`/collection/men/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                            key={category.id}
                            className="category-card animate-pop-in"
                            aria-label={`Explore Men's ${category.name} collection`} // Accessibility/SEO improvement
                        >
                            <img
                                src={category.imageUrl || category.image}
                                alt={`DOR Men's ${category.name} collection for rent`}
                                className="category-card-image"
                                loading="lazy"
                                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x300/cccccc/333333?text=Men's ${category.name}`; }}
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
      {/* Women's Collection Section */}
    <section id="women" ref={womenRef} className={`section bg-neutral-100 ${womenIsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
        <div className="container">
            {/* H2 tag is appropriate for the section title */}
            <h2 className="section-title">Women's Collection</h2>
            <p className="section-description">
                Dazzle in our exquisite range of designer gowns, lehengas, and dresses, perfect for bridal, pre-wedding, maternity, and all special occasions. Rent stunning women's outfits in <strong className="highlight">Pune</strong> and <strong className="highlight">Nagpur</strong>.
            </p>
            {loadingCategories ? (
                <p className="text-center text-gray-600">Loading women's categories...</p>
            ) : categoryError ? (
                <p className="text-center text-red-500">{categoryError}</p>
            ) : (
                <div className="grid-4-col"> {/* Keeping grid-4-col for consistency, assuming its responsiveness is handled */}
                    {womenCategories.map((category) => (
                        <Link
                            to={`/collection/women/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                            key={category.id}
                            className="category-card alt-card animate-pop-in"
                            aria-label={`Explore Women's ${category.name} collection`} // Accessibility/SEO improvement
                        >
                            <img
                                src={category.imageUrl || category.image}
                                alt={`DOR Women's ${category.name} for rent`}
                                className="category-card-image"
                                loading="lazy"
                                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x300/cccccc/333333?text=Women's ${category.name}`; }}
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
            {/* H2 tag is appropriate for the section title */}
            <h2 className="section-title">How to Rent Your Perfect Outfit from DOR</h2>
            <div className="grid-3-col">
                <div className={`how-it-works-step-card ${howItWorksIsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '0.1s' }}>
                    <div className="how-it-works-icon-wrapper">
                        <Sparkles size={36} className="how-it-works-icon" />
                    </div>
                    <h3 className="card-title">1. Choose Your Outfit</h3>
                    <p className="step-description">Browse our extensive collection of designer lehengas, sherwanis, gowns, suits, and other premium dresses for all occasions available for rent in <strong className="highlight">Pune</strong> and <strong className="highlight">Nagpur</strong>.</p>
                </div>
                <div className={`how-it-works-step-card ${howItWorksIsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '0.2s' }}>
                    <div className="how-it-works-icon-wrapper">
                        <Shirt size={36} className="how-it-works-icon" />
                    </div>
                    <h3 className="card-title">2. Select Dates & Size</h3>
                    <p className="step-description">Pick your rental period and find your perfect fit with our detailed size guides. We offer personalized fittings at our <strong className="highlight">Pune</strong> and <strong className="highlight">Nagpur</strong> stores.</p>
                </div>
                <div className={`how-it-works-step-card ${howItWorksIsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '0.3s' }}>
                    <div className="how-it-works-icon-wrapper">
                        <Crown size={36} className="how-it-works-icon" />
                    </div>
                    <h3 className="card-title">3. Rock Your Look & Return</h3>
                    <p className="step-description">Enjoy your event! After your special occasion, simply return the rented outfit to us. We handle the cleaning and maintenance, making it hassle-free.</p>
                </div>
            </div>
        </div>
    </section>

    {/* SEO Change 1: Add HowTo Schema Markup using Helmet */}
    {/* This should be placed within your main <Helmet> component at the top of HomePage.js */}
    {/* If you already have a Helmet component, add this script tag inside it. */}
    <Helmet>
        <script type="application/ld+json">
            {`
                {
                    "@context": "https://schema.org",
                    "@type": "HowTo",
                    "name": "How to Rent a Dress from DOR - Dress On Rent",
                    "description": "A simple guide to renting premium ethnic and formal wear from DOR in Pune and Nagpur.",
                    "step": [
                        {
                            "@type": "HowToStep",
                            "name": "Choose Your Outfit",
                            "text": "Browse our extensive collection of designer lehengas, sherwanis, gowns, suits, and other premium dresses and suits for all occasions available for rent in Pune and Nagpur."
                        },
                        {
                            "@type": "HowToStep",
                            "name": "Select Dates & Size",
                            "text": "Pick your rental period and find your perfect fit with our detailed size guides. We offer fittings at our Pune and Nagpur stores."
                        },
                        {
                            "@type": "HowToStep",
                            "name": "Rock Your Look & Return",
                            "text": "Enjoy your event! After your special occasion, simply return the rented outfit to us. We handle the cleaning and maintenance."
                        }
                    ]
                }
            `}
        </script>
    </Helmet>

      {/* ✨ Style Advisor Section (Gemini API Integration) ✨ */}
     <section ref={styleAdvisorRef} className={`section bg-neutral-100 text-center ${styleAdvisorIsVisible ? 'animate-fade-in' : 'opacity-0'}`}>
        <div className="container">
            {/* H2 tag is appropriate for the section title */}
            <h2 className="section-title">✨ Get Personalized Style Advice for Your Rental Outfit ✨</h2>
            <p className="section-description-sub">
                Describe your event, and our AI-powered style advisor will suggest the perfect rental attire, from lehengas and sherwanis to gowns and suits, tailored for your occasion in <strong className="highlight">Pune</strong> or <strong className="highlight">Nagpur</strong>!
            </p>
            <div className="style-advisor-form">
                <textarea
                    className="style-advisor-textarea"
                    placeholder="e.g., 'A formal corporate gala dinner', 'A casual outdoor summer wedding', 'A traditional Indian festival'"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    rows="4"
                    aria-label="Describe your event for style advice" // SEO Change 1: Added aria-label for accessibility
                ></textarea>
                <button
                    onClick={getStyleAdvice}
                    disabled={isLoadingAdvice}
                    className="btn btn-primary btn-lg style-advisor-button animate-button-press"
                    aria-label={isLoadingAdvice ? "Getting style advice" : "Get personalized style advice"} // SEO Change 2: Dynamic aria-label for button
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


      {/* Testimonials Section */}
     <section
        id="testimonials"
        ref={testimonialsRef}
        className={`section bg-white ${testimonialsIsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}
        // SEO Change 1: Add Schema.org microdata for AggregateRating
        itemScope
        itemType="https://schema.org/AggregateRating"
    >
        <div className="container text-center">
            {/* SEO Change 2: Enhanced H2 title with keywords */}
            <h2 className="section-title">What Our Customers Say About DOR Dress On Rent in Pune & Nagpur</h2>
            <div className="grid-3-col gap-8">
                {testimonials.map((testimonial, index) => (
                    <div
                        key={index}
                        className="testimonial-card animate-pop-in"
                        style={{ transitionDelay: `${index * 0.1}s` }}
                        // SEO Change 3: Add Schema.org microdata for individual Review
                        itemScope
                        itemType="https://schema.org/Review"
                    >
                        <p className="testimonial-quote" itemProp="reviewBody">"{testimonial.quote}"</p>
                        {/* Display stars for rating */}
                        <div className="testimonial-rating" itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                            <meta itemProp="ratingValue" content={testimonial.rating} />
                            <meta itemProp="bestRating" content="5" />
                            <meta itemProp="worstRating" content="1" />
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
                        <p className="testimonial-author" itemProp="author" itemScope itemType="https://schema.org/Person">
                            <span itemProp="name">{testimonial.author}</span>
                        </p>
                        <p className="testimonial-city">{testimonial.city}</p>
                    </div>
                ))}
            </div>
            {/* SEO Change 4: Add AggregateRating properties */}
            {/* These meta tags provide the summary rating for the entire section */}
            <meta itemProp="ratingCount" content={testimonials.length} />
            {/* Calculate average rating dynamically for best accuracy */}
            <meta itemProp="ratingValue" content={(testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)} />

            {/* Add a link to your Google My Business reviews */}
            <div className="mt-8 text-center">
                <a
                    href="https://g.page/your-dor-pune-gmb-link/review?rc" // Replace with your actual Google My Business review link for Pune
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary animate-button-press"
                    aria-label="Read more customer reviews for DOR Dress On Rent on Google" // SEO Change 5: Added aria-label for accessibility
                >
                    Read More Reviews on Google <ChevronRight size={16} className="inline-block ml-1" />
                </a>
            </div>
        </div>
    </section>

    {/* Testimonials Data (if hardcoded, keep this part in your JS file) */}
    {/* Ensure this data is defined within your HomePage component or passed as props */}
    {/* Example: const testimonials = [...] */}
     <section
        id="about-us"
        ref={aboutUsRef}
        className={`section bg-neutral-100 ${aboutUsIsVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}
        // SEO Change 1: Add Schema.org microdata for Organization to the section
        itemScope
        itemType="https://schema.org/Organization"
    >
        <div className="container max-width-3xl text-center">
            {/* SEO Change 2: Enhanced H2 title with keywords */}
            <h2 className="section-title">About DOR - Your Premier Dress Rental Destination in Pune & Nagpur</h2>
            <div className="container about-us-split-container">
                <div className="about-us-split-image-wrapper">
                    <img
                        src={aboutus1}
                        // SEO Change 3: More descriptive alt text
                        alt="DOR Dress On Rent collection of designer gowns and ethnic wear"
                        className="about-us-split-image"
                        loading="lazy" // SEO Change 4: Add lazy loading for performance
                    />
                    <img
                        src={aboutus2}
                        // SEO Change 3: More descriptive alt text
                        alt="DOR team assisting a customer with a rental dress fitting"
                        className="about-us-split-image"
                        loading="lazy" // SEO Change 4: Add lazy loading for performance
                    />
                </div>
                <div className="about-us-split-content-wrapper">
                    {/* Keeping as h2 as per original structure, but semantically h3 might be considered if the above is the primary h2 */}
                    <h2 className="section-title text-left mb-6">More Than Just Fashion: This is DOR - Dress On Rent</h2>
                    <p className="about-us-split-text" itemProp="description">
                        Welcome to DOR, your premier destination for luxury **dress rentals** in **Pune** and **Nagpur**. Founded in **2020** from a shared passion for **sustainable fashion** and making high-end style accessible, we embarked on a mission to redefine elegance for every special occasion. We believe that renting designer clothing is more than just what you wear; it’s a form of expression, a statement of values, and a companion on your life’s most memorable journeys.
                    </p>
                    <p className="about-us-split-text">
                        Our curated collections are born from a desire to blend **timeless elegance with contemporary trends**, featuring **ethically sourced and meticulously crafted garments** for both men and women. Each **gown, lehenga, and suit** is thoughtfully selected and maintained, ensuring it not only looks exceptional but also feels incredible to wear. At DOR, we're deeply committed to **quality, affordability, and customer delight**, making **luxury fashion rental** sustainable and accessible for everyone across our **Pune and Nagpur stores**.
                    </p>
                    {/* Optional: If you have a more detailed about page */}
                    {/* <Link to="/about-detailed" className="btn btn-primary mt-4">Discover Our Full Story</Link> */}
                    <div className="about-us-split-highlights">
                        <div className="highlight-item">
                            <Sparkles size={28} className="highlight-icon text-pink-600" />
                            <div>
                                <h4 className="highlight-title">Quality First</h4>
                                <p className="highlight-text">Every gown, lehenga, and suit is carefully curated for impeccable craftsmanship and premium materials.</p>
                            </div>
                        </div>
                        <div className="highlight-item">
                            <Wand2 size={28} className="highlight-icon text-pink-600" />
                            <div>
                                <h4 className="highlight-title">Sustainable Style</h4>
                                <p className="highlight-text">Promoting eco-friendly fashion by extending the life cycle of designer attire through rental, reducing waste.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/* SEO Change 5: Add Organization Schema Markup using Helmet */}
    {/* This should be placed within your main <Helmet> component at the top of HomePage.js */}
    {/* If you already have a Helmet component, add this script tag inside it. */}
    <Helmet>
        <script type="application/ld+json">
            {`
                {
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    "name": "DOR - Dress On Rent",
                    "url": "https://www.your-website.com", // REPLACE with your actual website URL
                    "logo": "https://www.your-website.com/path/to/your/logo.png", // REPLACE with your logo image URL
                    "description": "DOR (Dress On Rent) offers luxury dress rentals for men and women in Pune and Nagpur, including designer gowns, lehengas, sherwanis, and suits for all special occasions, focusing on sustainable and accessible fashion.",
                    "sameAs": [
                        "https://www.facebook.com/your-facebook-page", // REPLACE with your actual Facebook URL
                        "https://www.instagram.com/your-instagram-page", // REPLACE with your actual Instagram URL
                        "https://twitter.com/your-twitter-handle" // REPLACE with your actual Twitter URL
                        // Add other social media links as needed
                    ],
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "Your Main Store Street Address, e.g., Shop No 5, ABC Towers", // REPLACE with your main store's street address
                        "addressLocality": "Pune",
                        "addressRegion": "Maharashtra",
                        "postalCode": "411001", // REPLACE with your main store's postal code
                        "addressCountry": "IN"
                    },
                    "contactPoint": {
                        "@type": "ContactPoint",
                        "telephone": "+91-98765-43210", // REPLACE with your primary contact number
                        "contactType": "customer service"
                    }
                }
            `}
        </script>
    </Helmet>

      {/* Footer */}
     <footer id="contact" className="footer">
        <div className="footer-container">
            <div className="footer-col">
                {/* SEO Change 1: Enhanced H3 heading with keywords */}
                <h3 className="footer-heading">DOR - Dress On Rent | Luxury Rentals in Pune & Nagpur</h3>
                <p className="footer-text">
                    Your premier destination for high-quality **lehenga, sherwani, gown, and suit rentals** in **Pune** and **Nagpur**. Elevate your style sustainably and affordably for any event.
                </p>
                <div className="social-links">
                    {/* SEO Change 2: Updated social media links with actual URLs and rel attributes */}
                    <a href="https://www.instagram.com/yourdorinstagram" target="_blank" rel="noopener noreferrer" className="social-icon animate-social-pop" aria-label="Visit DOR on Instagram"><Instagram size={24} /></a> {/* REPLACE with actual Instagram URL */}
                    <a href="https://www.facebook.com/yourdorfacebook" target="_blank" rel="noopener noreferrer" className="social-icon animate-social-pop" aria-label="Visit DOR on Facebook"><Facebook size={24} /></a> {/* REPLACE with actual Facebook URL */}
                    <a href="https://www.twitter.com/yourdortwitter" target="_blank" rel="noopener noreferrer" className="social-icon animate-social-pop" aria-label="Visit DOR on Twitter"><Twitter size={24} /></a> {/* REPLACE with actual Twitter URL */}
                </div>
            </div>

            <div className="footer-col">
                <h3 className="footer-heading">Quick Links</h3>
                <ul className="footer-list">
                    {/* SEO Change 3: Ensure anchor links are descriptive */}
                    <li><a href="#men" className="footer-link animate-footer-link-hover">Men's Collection</a></li>
                    <li><a href="#women" className="footer-link animate-footer-link-hover">Women's Collection</a></li>
                    <li><a href="#how-it-works" className="footer-link animate-footer-link-hover">How It Works</a></li>
                    <li><a href="#about-us" className="footer-link animate-footer-link-hover">About Us</a></li>
                    <li><Link to="/faq" className="footer-link animate-footer-link-hover">FAQ</Link></li> {/* Assuming /faq is a separate page */}
                </ul>
            </div>

            <div className="footer-col">
                <h3 className="footer-heading">Contact Us</h3>
                <ul className="footer-list">
                    <li className="contact-item"><Mail size={18} className="icon-mr" /> info@DOR.com</li> {/* REPLACE with actual email */}
                    <li className="contact-item"><Phone size={18} className="icon-mr" /> +91 98765 43210</li> {/* REPLACE with actual phone number */}
                    <li className="contact-item align-start"><MapPin size={18} className="icon-mr mt-1" />
                        <address className="address-text">
                            Our Stores:<br />
                            {/* SEO Change 4: Display full store names and addresses for local SEO */}
                            {loadingStores ? 'Loading...' : storeError ? 'Error loading stores' :
                                storeLocations.map(store => (
                                    <span key={store.id}>
                                        <strong>{store.name}</strong>: {store.address}<br/> {/* Assuming 'address' field exists in Firebase */}
                                    </span>
                                ))
                            }
                        </address>
                    </li>
                </ul>
            </div>
        </div>
        <div className="copyright">
            &copy; {new Date().getFullYear()} DOR. All rights reserved.
        </div>
    </footer>
    </div>
  );
}

export default HomePage;