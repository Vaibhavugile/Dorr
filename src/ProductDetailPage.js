import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ProductDetailPage.css'; // We'll create this CSS file
import { db } from './firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';

// Import icons from lucide-react
import { IndianRupee, ShoppingCart, Info, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

function ProductDetailPage() {
    const { gender, subcategoryName, productId } = useParams(); // Get params from URL

    const [product, setProduct] = useState(null);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [productError, setProductError] = useState('');

    // Product selection states
    const [selectedSize, setSelectedSize] = useState(''); // User selected size for rental
    const [selectedColor, setSelectedColor] = useState(''); // User selected color for rental (if product has multiple)

    // Image carousel state
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState(''); // 'success' or 'error'

    // --- Firebase Data Fetching for Single Product ---
    useEffect(() => {
        const fetchProduct = async () => {
            setLoadingProduct(true);
            setProductError('');
            setProduct(null); // Clear previous product

            if (!productId || !gender || !subcategoryName) {
                setProductError("Missing product ID, gender, or subcategory name in URL.");
                setLoadingProduct(false);
                return;
            }

            try {
                // Determine the correct parent collection based on gender
                const parentCollection = gender === 'men' ? 'menCategories' : 'womenCategories';

                // Step 1: Find the subcategory document ID by its name
                const subcategoryQuery = query(
                    collection(db, parentCollection),
                    where('name', '==', subcategoryName)
                );
                const subcategorySnapshot = await getDocs(subcategoryQuery);

                if (subcategorySnapshot.empty) {
                    setProductError(`Subcategory "${subcategoryName}" not found in ${parentCollection}.`);
                    setLoadingProduct(false);
                    return;
                }

                const subcategoryDoc = subcategorySnapshot.docs[0];
                const subcategoryDocId = subcategoryDoc.id; // This is the actual document ID!

                // Step 2: Fetch the product from the 'products' subcollection using the actual subcategoryDocId
                const productDocRef = doc(db, parentCollection, subcategoryDocId, 'products', productId);
                const productDocSnap = await getDoc(productDocRef);

                if (!productDocSnap.exists()) {
                    setProductError("Product not found with the given ID and category.");
                    setLoadingProduct(false);
                    return;
                }

                const productData = productDocSnap.data();
                setProduct({ id: productDocSnap.id, ...productData });

                // Set initial selected size/color if available
                if (productData.sizes && productData.sizes.length > 0) {
                    setSelectedSize(productData.sizes[0]);
                }
                // Prioritize 'colors' array, then 'color' string
                if (productData.colors && productData.colors.length > 0) {
                    setSelectedColor(productData.colors[0]);
                } else if (productData.color) {
                    setSelectedColor(productData.color);
                }

                // Reset image index when new product loads
                setCurrentImageIndex(0);

            } catch (error) {
                console.error("Error fetching product:", error);
                setProductError("Failed to load product details. Please try again later. " + error.message);
            } finally {
                setLoadingProduct(false);
            }
        };

        fetchProduct();
    }, [productId, gender, subcategoryName]); // Re-fetch if product ID or category changes

    // --- Image Carousel Navigation ---
    const handleThumbnailClick = (index) => {
        setCurrentImageIndex(index);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? (product.images?.length || 1) - 1 : prevIndex - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === (product.images?.length || 1) - 1 ? 0 : prevIndex + 1
        );
    };


    // --- Add to Cart (Placeholder) ---
    const handleAddToCart = async () => {
        if (!product || !selectedSize || !selectedColor) {
            setModalMessage('Please select a size and color before adding to cart.');
            setModalType('error');
            setShowModal(true);
            return;
        }

        try {
            // Determine the correct parent collection based on gender for booking path
            const parentCollection = gender === 'men' ? 'menCategories' : 'womenCategories';

            // Find the subcategory document ID by its name for the booking path
            const subcategoryQuery = query(
                collection(db, parentCollection),
                where('name', '==', subcategoryName)
            );
            const subcategorySnapshot = await getDocs(subcategoryQuery);
            if (subcategorySnapshot.empty) {
                setModalMessage(`Error: Could not find category for booking.`);
                setModalType('error');
                setShowModal(true);
                return;
            }
            const subcategoryDocId = subcategorySnapshot.docs[0].id;

            // Simulate adding to cart - in a real app, this would add to a user's cart collection
            // or a temporary client-side state.
            // For now, we'll log it and show a success message.
            console.log("Product added to cart simulated:", {
                productId: product.id,
                name: product.name,
                size: selectedSize,
                color: selectedColor,
                rent: product.rent,
                // userId: currentUser.uid (if you have auth)
            });

            setModalMessage(`"${product.name}" (${selectedSize}, ${selectedColor}) has been added to your cart!`);
            setModalType('success');
            setShowModal(true);

        } catch (error) {
            console.error("Error adding to cart:", error);
            setModalMessage('Failed to add to cart. Please try again.');
            setModalType('error');
            setShowModal(true);
        }
    };

    // Function to close modal
    const closeModal = () => {
        setShowModal(false);
        setModalMessage('');
        setModalType('');
    };

    if (loadingProduct) {
        return (
            <div className="product-detail-page loading-state">
                <Loader2 size={48} className="animate-spin text-blue-500" />
                <p>Loading product details...</p>
            </div>
        );
    }

    if (productError) {
        return (
            <div className="product-detail-page error-state">
                <XCircle size={48} className="text-red-500" />
                <p>{productError}</p>
                <Link to={`/collection/${gender}/${subcategoryName}`} className="btn btn-primary mt-4">Back to Products</Link>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail-page error-state">
                <Info size={48} className="text-gray-500" />
                <p>Product data could not be loaded.</p>
                <Link to={`/collection/${gender}/${subcategoryName}`} className="btn btn-primary mt-4">Back to Products</Link>
            </div>
        );
    }

    // Determine the image to display in the main view
    const mainImageUrl = (product.images && product.images.length > 0)
        ? product.images[currentImageIndex]
        : product.imageUrl || `https://placehold.co/600x800/e0e0e0/333333?text=${product.name}`;

    return (
        <div className="product-detail-page">
            {/* Header for Product Detail */}
            <header className="product-detail-header">
                <div className="product-detail-header-content">
                    <h1 className="product-detail-title">{product.name}</h1>
                    <p className="product-detail-breadcrumb">
                        <Link to="/" className="breadcrumb-link">Home</Link>
                        <span className="breadcrumb-separator"> / </span>
                        <Link to={`/collection/${gender}`} className="breadcrumb-link">{gender === 'men' ? 'Men' : 'Women'}</Link>
                        <span className="breadcrumb-separator"> / </span>
                        <Link to={`/collection/${gender}/${subcategoryName}`} className="breadcrumb-link">{subcategoryName}</Link>
                        <span className="breadcrumb-separator"> / </span>
                        {product.name}
                    </p>
                </div>
            </header>

            <div className="product-detail-content-wrapper">
                {/* Product Image Gallery */}
                <div className="product-image-gallery">
                    <div className="main-image-container">
                        <img
                            src={mainImageUrl}
                            alt={product.name}
                            className="main-product-image"
                            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/600x800/cccccc/333333?text=${product.name}`; }}
                        />
                        {/* Navigation arrows for main image */}
                        {(product.images && product.images.length > 1) && (
                            <>
                                <button className="nav-arrow left-arrow" onClick={handlePrevImage} aria-label="Previous image">
                                    <ChevronLeft size={30} />
                                </button>
                                <button className="nav-arrow right-arrow" onClick={handleNextImage} aria-label="Next image">
                                    <ChevronRight size={30} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnail Gallery (scrollable) */}
                    {product.images && product.images.length > 1 && (
                        <div className="thumbnail-gallery">
                            {product.images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`${product.name} thumbnail ${index + 1}`}
                                    className={`thumbnail-image ${index === currentImageIndex ? 'active-thumbnail' : ''}`}
                                    onClick={() => handleThumbnailClick(index)}
                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/80x80/cccccc/333333?text=Thumb`; }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Information and Rental Options */}
                <div className="product-info-rental">
                    <h2 className="product-name-detail">{product.name}</h2>
                    <p className="product-code-detail">Product Code: {product.productCode}</p>
                    <p className="product-description">{product.description}</p>

                    <div className="price-info">
                        <span className="rent-price"><IndianRupee size={24} className="inline-icon" />{product.rent.toLocaleString('en-IN')}</span> / day
                        {product.originalPrice && (
                            <span className="original-price">M.R.P: <IndianRupee size={16} className="inline-icon" />{product.originalPrice.toLocaleString('en-IN')}</span>
                        )}
                    </div>

                    {/* Size Selection */}
                    <div className="selection-group">
                        <label htmlFor="size-select-detail">Select Size:</label>
                        <select
                            id="size-select-detail"
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                            className="detail-select"
                        >
                            {product.sizes && product.sizes.length > 0 ? (
                                product.sizes.map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))
                            ) : (
                                <option value="">No sizes available</option>
                            )}
                        </select>
                        {/* Link to size chart could go here */}
                        <a href="#" className="size-chart-link">Size Chart</a>
                    </div>

                    {/* Color Selection (if product has multiple colors) */}
                    {product.colors && product.colors.length > 1 && (
                        <div className="selection-group">
                            <label htmlFor="color-select-detail">Select Color:</label>
                            <select
                                id="color-select-detail"
                                value={selectedColor}
                                onChange={(e) => setSelectedColor(e.target.value)}
                                className="detail-select"
                            >
                                {product.colors.map(color => (
                                    <option key={color} value={color}>{color}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {/* Display single color if not multiple */}
                    {product.color && (!product.colors || product.colors.length <= 1) && (
                        <p className="product-color-display">Color: {product.color}</p>
                    )}

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <button
                            onClick={handleAddToCart}
                            disabled={!product || !selectedSize || !selectedColor} // Removed date/availability checks
                            className="btn btn-primary add-to-cart-btn"
                        >
                            <ShoppingCart size={20} className="icon-mr" /> Add to Cart
                        </button>
                        {/* Removed "Rent Now" button */}
                    </div>

                    {/* Additional Product Details */}
                    <div className="additional-details">
                        <h3 className="details-heading">More Details:</h3>
                        <p><strong>Material:</strong> {product.material || 'Not specified'}</p>
                        <p><strong>Care:</strong> {product.careInstructions || 'Dry clean only'}</p>
                        <p><strong>Available at:</strong> {product.availableStores ? product.availableStores.join(', ') : 'Check in-store'}</p>
                    </div>
                </div>
            </div>

            {/* Modal for messages */}
            {showModal && (
                <div className="modal-overlay">
                    <div className={`modal-content ${modalType}`}>
                        <button className="modal-close-button" onClick={closeModal}>&times;</button>
                        {modalType === 'success' ? <CheckCircle size={48} className="modal-icon success-icon" /> : <XCircle size={48} className="modal-icon error-icon" />}
                        <p className="modal-message">{modalMessage}</p>
                        <button onClick={closeModal} className="btn btn-primary modal-ok-button">OK</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductDetailPage;
