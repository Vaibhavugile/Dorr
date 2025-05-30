import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig'; // Import your initialized Firestore instance
import { collection, addDoc, getDocs, query, orderBy, doc, getDoc,setDoc } from 'firebase/firestore'; // Import necessary Firestore functions
import './AdminPage.css'; // We'll create this CSS file

function AdminPage() {
    // State for adding Categories
    const [menCategoryName, setMenCategoryName] = useState('');
    const [menCategoryImage, setMenCategoryImage] = useState('');
    const [menCategoryOrder, setMenCategoryOrder] = useState('');
    const [menCategoryMessage, setMenCategoryMessage] = useState('');
    const [menCategoryError, setMenCategoryError] = useState('');
    const [menCategoryLoading, setMenCategoryLoading] = useState(false);

    const [womenCategoryName, setWomenCategoryName] = useState('');
    const [womenCategoryImage, setWomenCategoryImage] = useState('');
    const [womenCategoryOrder, setWomenCategoryOrder] = useState('');
    const [womenCategoryMessage, setWomenCategoryMessage] = useState('');
    const [womenCategoryError, setWomenCategoryError] = useState('');
    const [womenCategoryLoading, setWomenCategoryLoading] = useState(false);

    // State for adding Products
    const [allMenCategories, setAllMenCategories] = useState([]);
    const [allWomenCategories, setAllWomenCategories] = useState([]);
    const [selectedProductGender, setSelectedProductGender] = useState('men');
    const [selectedProductCategoryId, setSelectedProductCategoryId] = useState('');
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productImageUrl, setProductImageUrl] = useState('');
    const [productImages, setProductImages] = useState([]); // Array for multiple images
    const [productCode, setProductCode] = useState('');
    const [productOriginalPrice, setProductOriginalPrice] = useState('');
    const [productRent, setProductRent] = useState('');
    const [productColor, setProductColor] = useState(''); // Changed to string for input
    const [productSizes, setProductSizes] = useState(''); // Changed to string for input (comma-separated)
    const [productMaterial, setProductMaterial] = useState('');
    const [productCareInstructions, setProductCareInstructions] = useState('');
    const [productAvailableStores, setProductAvailableStores] = useState(''); // Changed to string for input (comma-separated)
    const [productMessage, setProductMessage] = useState('');
    const [productError, setProductError] = useState('');
    const [productLoading, setProductLoading] = useState(false);


    // State for Dynamic Filter Options (for Admin Page dropdowns)
    const [dynamicStoreOptions, setDynamicStoreOptions] = useState([]);
    const [dynamicColorOptions, setDynamicColorOptions] = useState([]);
    const [dynamicSizeOptions, setDynamicSizeOptions] = useState([]);

    // --- Fetch Categories for Product Assignment ---
    useEffect(() => {
        const fetchCategories = async () => {
            const menCategoriesCol = collection(db, 'menCategories');
            const womenCategoriesCol = collection(db, 'womenCategories');

            const menSnapshot = await getDocs(query(menCategoriesCol, orderBy('order')));
            const womenSnapshot = await getDocs(query(womenCategoriesCol, orderBy('order')));

            setAllMenCategories(menSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setAllWomenCategories(womenSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        fetchCategories();
    }, []);

    // --- Fetch Dynamic Filter Options (for Admin product forms) ---
    useEffect(() => {
        const fetchDynamicFilterOptions = async () => {
            try {
                // Fetch Stores
                const storesSnapshot = await getDocs(collection(db, 'filterOptions', 'stores', 'list'));
                setDynamicStoreOptions(storesSnapshot.docs.map(doc => doc.id));

                // Fetch Colors
                const colorsSnapshot = await getDocs(collection(db, 'filterOptions', 'colors', 'list'));
                setDynamicColorOptions(colorsSnapshot.docs.map(doc => doc.id));

                // Fetch Sizes
                const sizesSnapshot = await getDocs(collection(db, 'filterOptions', 'sizes', 'list'));
                setDynamicSizeOptions(sizesSnapshot.docs.map(doc => doc.id));

            } catch (error) {
                console.error("Error fetching dynamic filter options for Admin:", error);
                // Handle error gracefully, perhaps set empty arrays or default options
            }
        };
        fetchDynamicFilterOptions();
    }, []); // Run once on mount

    // --- Handlers for adding Categories ---
    const handleAddMenCategory = async (e) => {
        e.preventDefault();
        setMenCategoryLoading(true);
        setMenCategoryMessage('');
        setMenCategoryError('');
        try {
            await addDoc(collection(db, 'menCategories'), {
                name: menCategoryName,
                imageUrl: menCategoryImage,
                order: parseInt(menCategoryOrder) || 0,
                addedDate: new Date().toISOString(),
            });
            setMenCategoryMessage('Men category added successfully!');
            setMenCategoryName('');
            setMenCategoryImage('');
            setMenCategoryOrder('');
            // Refresh categories list
            const menSnapshot = await getDocs(query(collection(db, 'menCategories'), orderBy('order')));
            setAllMenCategories(menSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (e) {
            console.error("Error adding men category: ", e);
            setMenCategoryError('Error adding men category.');
        } finally {
            setMenCategoryLoading(false);
        }
    };

    const handleAddWomenCategory = async (e) => {
        e.preventDefault();
        setWomenCategoryLoading(true);
        setWomenCategoryMessage('');
        setWomenCategoryError('');
        try {
            await addDoc(collection(db, 'womenCategories'), {
                name: womenCategoryName,
                imageUrl: womenCategoryImage,
                order: parseInt(womenCategoryOrder) || 0,
                addedDate: new Date().toISOString(),
            });
            setWomenCategoryMessage('Women category added successfully!');
            setWomenCategoryName('');
            setWomenCategoryImage('');
            setWomenCategoryOrder('');
            // Refresh categories list
            const womenSnapshot = await getDocs(query(collection(db, 'womenCategories'), orderBy('order')));
            setAllWomenCategories(womenSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (e) {
            console.error("Error adding women category: ", e);
            setWomenCategoryError('Error adding women category.');
        } finally {
            setWomenCategoryLoading(false);
        }
    };

    // --- Handler for adding Products ---
    const handleAddProduct = async (e) => {
        e.preventDefault();
        setProductLoading(true);
        setProductMessage('');
        setProductError('');

        if (!selectedProductCategoryId) {
            setProductError('Please select a category.');
            setProductLoading(false);
            return;
        }

        try {
            const parentCollection = selectedProductGender === 'men' ? 'menCategories' : 'womenCategories';
            const productsCollectionRef = collection(db, parentCollection, selectedProductCategoryId, 'products');

            // Convert comma-separated strings to arrays
            const availableStoresArray = productAvailableStores.split(',').map(s => s.trim()).filter(s => s);
            const sizesArray = productSizes.split(',').map(s => s.trim()).filter(s => s);

            const newProduct = {
                name: productName,
                description: productDescription,
                imageUrl: productImageUrl,
                images: productImages.filter(img => img), // Filter out empty strings if any
                productCode: productCode,
                originalPrice: productOriginalPrice ? parseFloat(productOriginalPrice) : null,
                rent: parseFloat(productRent) || 0,
                color: productColor,
                sizes: sizesArray,
                material: productMaterial,
                careInstructions: productCareInstructions,
                availableStores: availableStoresArray,
                addedDate: new Date().toISOString(), // Automatically add current timestamp
            };

            await addDoc(productsCollectionRef, newProduct);
            setProductMessage('Product added successfully!');

            // --- Step 3: Add/Update filter options in dedicated collections ---
            // Stores
            for (const store of availableStoresArray) {
                if (store) { // Ensure store name is not empty
                    const storeDocRef = doc(db, 'filterOptions', 'stores', 'list', store);
                    const storeDocSnap = await getDoc(storeDocRef);
                    if (!storeDocSnap.exists()) {
                        await addDoc(collection(db, 'filterOptions', 'stores', 'list'), { name: store }); // Use addDoc with random ID if doc.set is not preferred
                        // IMPORTANT: For collection(db, 'filterOptions', 'stores', 'list') to add a document with ID `store`, you should use `setDoc(doc(db, 'filterOptions', 'stores', 'list', store), {})`
                        // If you use addDoc, it generates a random ID. For filter options, using the name as ID is often better for uniqueness.
                        // Let's correct this to `setDoc` for controlled IDs, or use `addDoc` if random IDs are fine and you search by name.
                        // For simplicity and direct use with 'id' mapping in ProductsPage, using the name as the document ID is best.
                        await setDoc(doc(db, 'filterOptions', 'stores', 'list', store), { name: store }); // Store name as a field too, for clarity.
                    }
                }
            }

            // Colors
            if (productColor) {
                const colorDocRef = doc(db, 'filterOptions', 'colors', 'list', productColor);
                const colorDocSnap = await getDoc(colorDocRef);
                if (!colorDocSnap.exists()) {
                     await setDoc(doc(db, 'filterOptions', 'colors', 'list', productColor), { name: productColor });
                }
            }

            // Sizes
            for (const size of sizesArray) {
                if (size) {
                    const sizeDocRef = doc(db, 'filterOptions', 'sizes', 'list', size);
                    const sizeDocSnap = await getDoc(sizeDocRef);
                    if (!sizeDocSnap.exists()) {
                        await setDoc(doc(db, 'filterOptions', 'sizes', 'list', size), { name: size });
                    }
                }
            }
            // --- End of Step 3 ---

            // Clear form fields
            setProductName('');
            setProductDescription('');
            setProductImageUrl('');
            setProductImages([]);
            setProductCode('');
            setProductOriginalPrice('');
            setProductRent('');
            setProductColor('');
            setProductSizes('');
            setProductMaterial('');
            setProductCareInstructions('');
            setProductAvailableStores('');

        } catch (e) {
            console.error("Error adding product: ", e);
            setProductError('Error adding product.');
        } finally {
            setProductLoading(false);
        }
    };


    return (
        <div className="admin-page-container">
            <h1>Admin Dashboard</h1>

            {/* Section for Adding Categories */}
            <section className="admin-section">
                <h2>Add Men's Category</h2>
                <form onSubmit={handleAddMenCategory} className="admin-form">
                    <div className="form-group">
                        <label htmlFor="menCategoryName">Category Name:</label>
                        <input
                            type="text"
                            id="menCategoryName"
                            value={menCategoryName}
                            onChange={(e) => setMenCategoryName(e.target.value)}
                            placeholder="e.g., Lehengas, Sherwanis"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="menCategoryImage">Image URL:</label>
                        <input
                            type="url"
                            id="menCategoryImage"
                            value={menCategoryImage}
                            onChange={(e) => setMenCategoryImage(e.target.value)}
                            placeholder="e.g., https://example.com/image.jpg"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="menCategoryOrder">Display Order:</label>
                        <input
                            type="number"
                            id="menCategoryOrder"
                            value={menCategoryOrder}
                            onChange={(e) => setMenCategoryOrder(e.target.value)}
                            placeholder="e.g., 1, 2, 3"
                        />
                    </div>
                    <button type="submit" disabled={menCategoryLoading} className="admin-btn">
                        {menCategoryLoading ? 'Adding...' : 'Add Men Category'}
                    </button>
                    {menCategoryMessage && <p className="success-message">{menCategoryMessage}</p>}
                    {menCategoryError && <p className="error-message">{menCategoryError}</p>}
                </form>
            </section>

            <section className="admin-section">
                <h2>Add Women's Category</h2>
                <form onSubmit={handleAddWomenCategory} className="admin-form">
                    <div className="form-group">
                        <label htmlFor="womenCategoryName">Category Name:</label>
                        <input
                            type="text"
                            id="womenCategoryName"
                            value={womenCategoryName}
                            onChange={(e) => setWomenCategoryName(e.target.value)}
                            placeholder="e.g., Gowns, Sarees"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="womenCategoryImage">Image URL:</label>
                        <input
                            type="url"
                            id="womenCategoryImage"
                            value={womenCategoryImage}
                            onChange={(e) => setWomenCategoryImage(e.target.value)}
                            placeholder="e.g., https://example.com/image.jpg"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="womenCategoryOrder">Display Order:</label>
                        <input
                            type="number"
                            id="womenCategoryOrder"
                            value={womenCategoryOrder}
                            onChange={(e) => setWomenCategoryOrder(e.target.value)}
                            placeholder="e.g., 1, 2, 3"
                        />
                    </div>
                    <button type="submit" disabled={womenCategoryLoading} className="admin-btn">
                        {womenCategoryLoading ? 'Adding...' : 'Add Women Category'}
                    </button>
                    {womenCategoryMessage && <p className="success-message">{womenCategoryMessage}</p>}
                    {womenCategoryError && <p className="error-message">{womenCategoryError}</p>}
                </form>
            </section>

            {/* Section for Adding Products */}
            <section className="admin-section">
                <h2>Add Product</h2>
                <form onSubmit={handleAddProduct} className="admin-form">
                    <div className="form-group">
                        <label htmlFor="productGender">Product Gender:</label>
                        <select
                            id="productGender"
                            value={selectedProductGender}
                            onChange={(e) => setSelectedProductGender(e.target.value)}
                            required
                        >
                            <option value="men">Men</option>
                            <option value="women">Women</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="productCategory">Select Category:</label>
                        <select
                            id="productCategory"
                            value={selectedProductCategoryId}
                            onChange={(e) => setSelectedProductCategoryId(e.target.value)}
                            required
                        >
                            <option value="">-- Select a Category --</option>
                            {selectedProductGender === 'men' ? (
                                allMenCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))
                            ) : (
                                allWomenCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="productName">Product Name:</label>
                        <input
                            type="text"
                            id="productName"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder="e.g., Elegant Bridal Lehenga"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="productDescription">Description:</label>
                        <textarea
                            id="productDescription"
                            value={productDescription}
                            onChange={(e) => setProductDescription(e.target.value)}
                            placeholder="Detailed description of the product."
                            rows="4"
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="productImageUrl">Main Image URL:</label>
                        <input
                            type="url"
                            id="productImageUrl"
                            value={productImageUrl}
                            onChange={(e) => setProductImageUrl(e.target.value)}
                            placeholder="e.g., https://example.com/main_image.jpg"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="productImages">Additional Image URLs (comma-separated):</label>
                        <input
                            type="text"
                            id="productImages"
                            value={productImages.join(', ')} // Display as comma-separated string
                            onChange={(e) => setProductImages(e.target.value.split(',').map(url => url.trim()))}
                            placeholder="url1, url2, url3"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="productCode">Product Code:</label>
                        <input
                            type="text"
                            id="productCode"
                            value={productCode}
                            onChange={(e) => setProductCode(e.target.value)}
                            placeholder="e.g., LHNGA001"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="productOriginalPrice">Original Price (optional):</label>
                        <input
                            type="number"
                            id="productOriginalPrice"
                            value={productOriginalPrice}
                            onChange={(e) => setProductOriginalPrice(e.target.value)}
                            placeholder="e.g., 15000"
                            step="0.01"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="productRent">Rent per day:</label>
                        <input
                            type="number"
                            id="productRent"
                            value={productRent}
                            onChange={(e) => setProductRent(e.target.value)}
                            placeholder="e.g., 1000"
                            step="0.01"
                            required
                        />
                    </div>
                    {/* Updated to use dynamic options or text input with suggested values */}
                    <div className="form-group">
                        <label htmlFor="productColor">Color:</label>
                        <input
                            type="text"
                            id="productColor"
                            list="color-options"
                            value={productColor}
                            onChange={(e) => setProductColor(e.target.value)}
                            placeholder="e.g., Red, Blue, Marron Valvet"
                            required
                        />
                        <datalist id="color-options">
                            {dynamicColorOptions.map(option => (
                                <option key={option} value={option} />
                            ))}
                        </datalist>
                    </div>
                    <div className="form-group">
                        <label htmlFor="productSizes">Sizes (comma-separated):</label>
                        <input
                            type="text"
                            id="productSizes"
                            list="size-options"
                            value={productSizes}
                            onChange={(e) => setProductSizes(e.target.value)}
                            placeholder="e.g., S, M, L, XL"
                            required
                        />
                         <datalist id="size-options">
                            {dynamicSizeOptions.map(option => (
                                <option key={option} value={option} />
                            ))}
                        </datalist>
                    </div>
                    <div className="form-group">
                        <label htmlFor="productAvailableStores">Available Stores (comma-separated):</label>
                        <input
                            type="text"
                            id="productAvailableStores"
                            list="store-options"
                            value={productAvailableStores}
                            onChange={(e) => setProductAvailableStores(e.target.value)}
                            placeholder="e.g., Camp, Pune, Wakad"
                            required
                        />
                        <datalist id="store-options">
                            {dynamicStoreOptions.map(option => (
                                <option key={option} value={option} />
                            ))}
                        </datalist>
                    </div>
                    <div className="form-group">
                        <label htmlFor="productMaterial">Material:</label>
                        <input
                            type="text"
                            id="productMaterial"
                            value={productMaterial}
                            onChange={(e) => setProductMaterial(e.target.value)}
                            placeholder="e.g., Silk, Cotton Blend"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="productCareInstructions">Care Instructions:</label>
                        <input
                            type="text"
                            id="productCareInstructions"
                            value={productCareInstructions}
                            onChange={(e) => setProductCareInstructions(e.target.value)}
                            placeholder="e.g., Dry clean only"
                        />
                    </div>

                    <button type="submit" disabled={productLoading || !selectedProductCategoryId} className="admin-btn">
                        {productLoading ? 'Adding Product...' : 'Add Product'}\
                    </button>
                    {productMessage && <p className="success-message">{productMessage}</p>}
                    {productError && <p className="error-message">\{productError}</p>}
                </form>
            </section>
        </div>
    );
}

export default AdminPage;