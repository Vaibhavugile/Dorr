// ProductsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ProductsPage.css'; // Make sure this path is correct
import { db } from './firebaseConfig'; // Your initialized Firestore instance
import { collection, query, where, getDocs, orderBy as firebaseOrderBy } from 'firebase/firestore';

// Import icons from lucide-react (or other icon library you prefer)
import { Filter, ListFilter, IndianRupee, ShoppingCart, Loader2, XCircle, MapPin } from 'lucide-react'; // Added MapPin for store icon example

function ProductsPage() {
    const { gender, subcategoryName } = useParams();

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [productError, setProductError] = useState('');

    // Filter states
    const [selectedStore, setSelectedStore] = useState('All'); // Initial state 'All' or a specific default store like 'Mumbai'
    const [selectedColor, setSelectedColor] = useState('All');
    const [selectedSize, setSelectedSize] = useState('All');
    const [sortBy, setSortBy] = useState('rentAsc'); // 'rentAsc', 'rentDesc', 'newest'

    // State for showing/hiding mobile filters
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // New states for dynamic filter options
    const [dynamicStores, setDynamicStores] = useState([]);
    const [dynamicColors, setDynamicColors] = useState([]);
    const [dynamicSizes, setDynamicSizes] = useState([]);

    // State for initial store selection overlay
    const [showInitialStoreSelection, setShowInitialStoreSelection] = useState(true); // Set to true to show the initial modal

    // --- Fetch Dynamic Filter Options from Firebase ---
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                // Fetch Stores from 'filterOptions/stores/list' collection
                const storesSnapshot = await getDocs(collection(db, 'filterOptions', 'stores', 'list'));
                const fetchedStores = storesSnapshot.docs.map(doc => doc.id);
                // Ensure 'All' is not included in the initial selection options, only in the filter dropdown later
                setDynamicStores(['All', ...fetchedStores]);

                // Fetch Colors from 'filterOptions/colors/list' collection
                const colorsSnapshot = await getDocs(collection(db, 'filterOptions', 'colors', 'list'));
                const fetchedColors = colorsSnapshot.docs.map(doc => doc.id);
                setDynamicColors(['All', ...fetchedColors]); // Add 'All' option

                // Fetch Sizes from 'filterOptions/sizes/list' collection
                const sizesSnapshot = await getDocs(collection(db, 'filterOptions', 'sizes', 'list'));
                const fetchedSizes = sizesSnapshot.docs.map(doc => doc.id);
                setDynamicSizes(['All', ...fetchedSizes]); // Add 'All' option

            } catch (error) {
                console.error("Error fetching filter options:", error);
            }
        };

        fetchFilterOptions();
    }, []); // Empty dependency array means this runs once on component mount

    // --- Firebase Data Fetching for Products ---
    useEffect(() => {
        const fetchProducts = async () => {
            // Prevent fetching if the initial store selection modal is active and no store is chosen
            if (showInitialStoreSelection && selectedStore === 'All') {
                setLoadingProducts(false); // Ensure loading is false
                setProductError('Please select a store to view products.'); // Update message
                return;
            }

            setLoadingProducts(true);
            setProductError('');
            setProducts([]); // Clear previous products

            if (!gender || !subcategoryName) {
                setProductError("Invalid category or subcategory selected.");
                setLoadingProducts(false);
                return;
            }

            try {
                const parentCollection = gender === 'men' ? 'menCategories' : 'womenCategories';

                const subcategoryQuery = query(
                    collection(db, parentCollection),
                    where('name', '==', subcategoryName)
                );
                const subcategorySnapshot = await getDocs(subcategoryQuery);

                if (subcategorySnapshot.empty) {
                    setProductError(`Subcategory "${subcategoryName}" not found.`);
                    setLoadingProducts(false);
                    return;
                }

                const subcategoryDoc = subcategorySnapshot.docs[0];
                const subcategoryDocId = subcategoryDoc.id;

                let productsCollectionRef = collection(db, parentCollection, subcategoryDocId, 'products');

                let queriesToExecute = [];

                // 1. Build the base query with non-array-contains filters and sorting
                let currentBaseQuery = productsCollectionRef;

                // Apply 'color' filter (this is an equality filter, so it can be combined with one array-contains)
                if (selectedColor !== 'All') {
                    currentBaseQuery = query(currentBaseQuery, where('color', '==', selectedColor));
                }

                // Apply sorting
                if (sortBy === 'rentAsc') {
                    currentBaseQuery = query(currentBaseQuery, firebaseOrderBy('rent', 'asc'));
                } else if (sortBy === 'rentDesc') {
                    currentBaseQuery = query(currentBaseQuery, firebaseOrderBy('rent', 'desc'));
                } else if (sortBy === 'newest') {
                    currentBaseQuery = query(currentBaseQuery, firebaseOrderBy('addedDate', 'desc'));
                }

                // 2. Conditionally add array-contains queries to the list of queries to execute
                // Each array-contains filter will trigger a separate query if active
                if (selectedStore !== 'All') {
                    queriesToExecute.push(query(currentBaseQuery, where('availableStores', 'array-contains', selectedStore)));
                }

                if (selectedSize !== 'All') {
                    queriesToExecute.push(query(currentBaseQuery, where('sizes', 'array-contains', selectedSize)));
                }

                // 3. If no array-contains filters were applied, just run the base query
                if (queriesToExecute.length === 0) {
                    queriesToExecute.push(currentBaseQuery);
                }

                let allProducts = [];
                const seenProductIds = new Set(); // To prevent duplicate products from multiple queries

                // 4. Execute all generated queries and merge results
                for (const q of queriesToExecute) {
                    const querySnapshot = await getDocs(q);
                    querySnapshot.forEach((doc) => {
                        if (!seenProductIds.has(doc.id)) {
                            allProducts.push({ id: doc.id, ...doc.data() });
                            seenProductIds.add(doc.id);
                        }
                    });
                }

                setProducts(allProducts);

            } catch (error) {
                console.error("Error fetching products:", error);
                setProductError("Failed to load products. Please try again later.");
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchProducts();
    }, [gender, subcategoryName, selectedStore, selectedColor, selectedSize, sortBy, showInitialStoreSelection]); // Added showInitialStoreSelection as a dependency

    // Handlers for filter/sort changes
    const handleStoreChange = (e) => setSelectedStore(e.target.value);
    const handleColorChange = (e) => setSelectedColor(e.target.value);
    const handleSizeChange = (e) => setSelectedSize(e.target.value);
    const handleSortByChange = (e) => setSortBy(e.target.value);

    // Modified handler for initial store selection (now for cards)
    const handleInitialStoreSelect = (storeName) => {
        setSelectedStore(storeName);
        setShowInitialStoreSelection(false); // Hide the prompt after selection
    };

    // Clear all filters
    const clearFilters = () => {
        setSelectedStore('All');
        setSelectedColor('All');
        setSelectedSize('All');
        setSortBy('rentAsc');
        // If you clear filters, you might want to bring back the initial selection prompt
        // if you want to force selection again. Otherwise, don't uncomment the line below.
        // setShowInitialStoreSelection(true);
    };

    // Toggle mobile filters visibility
    const toggleMobileFilters = () => {
        setShowMobileFilters(!showMobileFilters);
    };

    return (
        <div className="products-page">
            {/* Initial Store Selection Overlay/Modal */}
            {showInitialStoreSelection && (
                <div className="initial-store-overlay">
                    <div className="initial-store-modal">
                        <h2>Select Your Preferred Store</h2>
                        <p>Please choose a store to view available products.</p>
                        <div className="store-cards-container"> {/* New container for cards */}
                            {/* Filter out 'All' from options in the initial modal as it's meant for specific selection */}
                            {dynamicStores.filter(store => store !== 'All').map(store => (
                                <div
                                    key={store}
                                    className={`store-card ${selectedStore === store ? 'selected' : ''}`}
                                    onClick={() => handleInitialStoreSelect(store)}
                                >
                                    <MapPin size={32} className="store-icon" /> {/* Example icon */}
                                    <span className="store-name">{store}</span>
                                </div>
                            ))}
                        </div>
                        {selectedStore !== 'All' && ( // Show continue button only if a store is selected
                            <button className="confirm-store-btn" onClick={() => setShowInitialStoreSelection(false)}>
                                View Products
                            </button>
                        )}
                    </div>
                </div>
            )}

            <header className="products-header">
                <div className="products-header-content">
                    <h1 className="products-title">{subcategoryName} Collection</h1>
                    <p className="products-breadcrumb">
                        <Link to="/" className="breadcrumb-link">Home</Link>
                        <span className="breadcrumb-separator"> / </span>
                        <Link to={`/collection/${gender}`} className="breadcrumb-link">{gender === 'men' ? 'Men' : 'Women'}</Link>
                        <span className="breadcrumb-separator"> / </span>
                        {subcategoryName}
                    </p>
                </div>
            </header>

            {/* Horizontal Filter Bar */}
            <div className="filter-bar-wrapper">
                <div className="filter-bar">
                    <button className="mobile-filter-toggle" onClick={toggleMobileFilters}>
                        <Filter size={18} /> <span className="toggle-text">Filters</span>
                    </button>

                    <div className="filter-group desktop-filter">
                        <label htmlFor="store-select">Store:</label>
                        <select id="store-select" value={selectedStore} onChange={handleStoreChange} className="filter-select">
                            {/* Dynamically populated store options */}
                            {dynamicStores.map(store => (
                                <option key={store} value={store}>{store}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group desktop-filter">
                        <label htmlFor="color-select">Color:</label>
                        <select id="color-select" value={selectedColor} onChange={handleColorChange} className="filter-select">
                            {/* Dynamically populated color options */}
                            {dynamicColors.map(color => (
                                <option key={color} value={color}>{color}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group desktop-filter">
                        <label htmlFor="size-select">Size:</label>
                        <select id="size-select" value={selectedSize} onChange={handleSizeChange} className="filter-select">
                            {/* Dynamically populated size options */}
                            {dynamicSizes.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group desktop-filter">
                        <label htmlFor="sort-by-select">Sort By:</label>
                        <select id="sort-by-select" value={sortBy} onChange={handleSortByChange} className="filter-select">
                            <option value="rentAsc">Rent: Low to High</option>
                            <option value="rentDesc">Rent: High to Low</option>
                            <option value="newest">Newest Arrivals</option>
                        </select>
                    </div>

                    <button className="clear-filters-btn desktop-filter" onClick={clearFilters}>
                        <XCircle size={18} /> Clear
                    </button>
                </div>
            </div>

            {/* Main Content (Product Listing) */}
            <div className="products-content-wrapper">
                {/* Mobile Filter Overlay */}
                <aside className={`products-filters-overlay ${showMobileFilters ? 'show' : ''}`}>
                    <div className="filters-header">
                        <h2 className="filters-title"><Filter size={24} className="icon-mr" /> Filters & Sort</h2>
                        <button className="close-filters-btn" onClick={toggleMobileFilters}>
                            &times;
                        </button>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="store-select-overlay">Store Location:</label>
                        <select id="store-select-overlay" value={selectedStore} onChange={handleStoreChange} className="filter-select">
                            {/* Dynamically populated store options */}
                            {dynamicStores.map(store => (
                                <option key={store} value={store}>{store}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="color-select-overlay">Color:</label>
                        <select id="color-select-overlay" value={selectedColor} onChange={handleColorChange} className="filter-select">
                            {/* Dynamically populated color options */}
                            {dynamicColors.map(color => (
                                <option key={color} value={color}>{color}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="size-select-overlay">Size:</label>
                        <select id="size-select-overlay" value={selectedSize} onChange={handleSizeChange} className="filter-select">
                            {/* Dynamically populated size options */}
                            {dynamicSizes.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="sort-by-select-overlay">Order:</label>
                        <select id="sort-by-select-overlay" value={sortBy} onChange={handleSortByChange} className="filter-select">
                            <option value="rentAsc">Rent: Low to High</option>
                            <option value="rentDesc">Rent: High to Low</option>
                            <option value="newest">Newest Arrivals</option>
                        </select>
                    </div>
                    <button className="clear-filters-btn-overlay" onClick={clearFilters}>
                        <XCircle size={20} className="icon-mr" /> Clear All Filters
                    </button>
                </aside>

                <main className="products-listing">
                    {/* Conditional rendering based on initial selection, loading, error, products */}
                    {showInitialStoreSelection ? (
                        <div className="message-container">
                            <p className="message-text">Please select a store from the overlay to view products.</p>
                        </div>
                    ) : loadingProducts ? (
                        <div className="message-container loading">
                            <Loader2 size={48} className="animate-spin text-blue-500" />
                            <p className="message-text">Fetching amazing products...</p>
                        </div>
                    ) : productError ? (
                        <p className="message-container error">
                            <XCircle size={24} className="icon-mr" /> {productError}
                        </p>
                    ) : products.length === 0 ? (
                        <p className="message-container no-products">
                            No products found matching your criteria. Try adjusting filters!
                        </p>
                    ) : (
                        <div className="product-grid">
                            {products.map(product => (
                                <Link
                                    to={`/product/${gender}/${subcategoryName}/${product.id}`}
                                    key={product.id}
                                    className="product-card-link"
                                >
                                    <div className="product-card">
                                        <div className="product-image-container">
                                            <img
                                                src={product.imageUrl || `https://placehold.co/250x300/e0e0e0/333333?text=${product.name.split(' ')[0]}`}
                                                alt={product.name}
                                                className="product-image"
                                                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/250x300/cccccc/333333?text=Image Not Found`; }}
                                            />
                                        </div>
                                        <div className="product-info">
                                            <h3 className="product-name">{product.name}</h3>
                                            <p className="product-color">Available Stores: {product.availableStores ? product.availableStores.join(', '):'N/A' }</p>
                                            <p className="product-color">Available Sizes: {product.sizes ? product.sizes.join(', '):'N/A' }</p>

                                            <p className="product-rent">
                                                <IndianRupee size={14} className="inline-icon" />{product.rent.toLocaleString('en-IN')}
                                                <span className="rent-per-day"> for 3 days</span>
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default ProductsPage;