// src/AdminPage.js
import React, { useState } from 'react';
import { db } from './firebaseConfig'; // Import your initialized Firestore instance
import { collection, addDoc } from 'firebase/firestore'; // Import addDoc for adding documents
import './AdminPage.css'; // We'll create this CSS file

function AdminPage() {
    const [menCategoryName, setMenCategoryName] = useState('');
    const [menCategoryImage, setMenCategoryImage] = useState('');
    const [menCategoryOrder, setMenCategoryOrder] = useState('');
    const [menMessage, setMenMessage] = useState('');
    const [menError, setMenError] = useState('');
    const [menLoading, setMenLoading] = useState(false);

    const [womenCategoryName, setWomenCategoryName] = useState('');
    const [womenCategoryImage, setWomenCategoryImage] = useState('');
    const [womenCategoryOrder, setWomenCategoryOrder] = useState('');
    const [womenMessage, setWomenMessage] = useState('');
    const [womenError, setWomenError] = useState('');
    const [womenLoading, setWomenLoading] = useState(false);

    const handleAddMenCategory = async (e) => {
        e.preventDefault(); // Prevent default form submission
        if (!menCategoryName || !menCategoryImage || !menCategoryOrder) {
            setMenError('All fields are required for Men\'s Category.');
            return;
        }

        setMenLoading(true);
        setMenMessage('');
        setMenError('');

        try {
            await addDoc(collection(db, 'menCategories'), {
                name: menCategoryName,
                image: menCategoryImage,
                order: parseInt(menCategoryOrder, 10) // Ensure order is stored as a number
            });
            setMenMessage('Men\'s category added successfully!');
            setMenCategoryName('');
            setMenCategoryImage('');
            setMenCategoryOrder('');
        } catch (error) {
            console.error('Error adding Men\'s category:', error);
            setMenError('Failed to add Men\'s category: ' + error.message);
        } finally {
            setMenLoading(false);
        }
    };

    const handleAddWomenCategory = async (e) => {
        e.preventDefault(); // Prevent default form submission
        if (!womenCategoryName || !womenCategoryImage || !womenCategoryOrder) {
            setWomenError('All fields are required for Women\'s Category.');
            return;
        }

        setWomenLoading(true);
        setWomenMessage('');
        setWomenError('');

        try {
            await addDoc(collection(db, 'womenCategories'), {
                name: womenCategoryName,
                image: womenCategoryImage,
                order: parseInt(womenCategoryOrder, 10) // Ensure order is stored as a number
            });
            setWomenMessage('Women\'s category added successfully!');
            setWomenCategoryName('');
            setWomenCategoryImage('');
            setWomenCategoryOrder('');
        } catch (error) {
            console.error('Error adding Women\'s category:', error);
            setWomenError('Failed to add Women\'s category: ' + error.message);
        } finally {
            setWomenLoading(false);
        }
    };

    return (
        <div className="admin-page-container">
            <h1>Admin Panel</h1>

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
                            placeholder="e.g., Suits"
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
                            placeholder="e.g., https://placehold.co/400x300/..."
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="menCategoryOrder">Display Order (Number):</label>
                        <input
                            type="number"
                            id="menCategoryOrder"
                            value={menCategoryOrder}
                            onChange={(e) => setMenCategoryOrder(e.target.value)}
                            placeholder="e.g., 1, 2, 3..."
                            required
                        />
                    </div>
                    <button type="submit" disabled={menLoading}>
                        {menLoading ? 'Adding...' : 'Add Men\'s Category'}
                    </button>
                    {menMessage && <p className="success-message">{menMessage}</p>}
                    {menError && <p className="error-message">{menError}</p>}
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
                            placeholder="e.g., Bridal Gowns"
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
                            placeholder="e.g., https://placehold.co/400x300/..."
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="womenCategoryOrder">Display Order (Number):</label>
                        <input
                            type="number"
                            id="womenCategoryOrder"
                            value={womenCategoryOrder}
                            onChange={(e) => setWomenCategoryOrder(e.target.value)}
                            placeholder="e.g., 1, 2, 3..."
                            required
                        />
                    </div>
                    <button type="submit" disabled={womenLoading}>
                        {womenLoading ? 'Adding...' : 'Add Women\'s Category'}
                    </button>
                    {womenMessage && <p className="success-message">{womenMessage}</p>}
                    {womenError && <p className="error-message">{womenError}</p>}
                </form>
            </section>
        </div>
    );
}

export default AdminPage;