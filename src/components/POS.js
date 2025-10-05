import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchRecipes, createOrder } from '../utils/api';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Smartphone
} from 'lucide-react';
import '../styles/admin-components.css';

const POS = () => {
  const { token } = useAuth();
  
  // State for menu items
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // State for cart and order
  const [cart, setCart] = useState([]);
  const [customerMobile, setCustomerMobile] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(10); // 10% tax
  const [promoCode, setPromoCode] = useState('');

  // State for UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);

  // Categories - will be updated based on recipes data
  const [categories, setCategories] = useState(['All']);

  // Fetch menu items from recipes API
  const fetchMenuItems = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching recipes with token:', token ? 'Token available' : 'No token');
      const recipes = await fetchRecipes(token);
      
      // Transform recipes data to menu items format
      const transformedItems = recipes.map(recipe => ({
        id: recipe.id,
        name: recipe.title,
        price: recipe.price || 0,
        category: recipe.category || 'Food',
        image: recipe.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop'
      }));
      
      // Extract unique categories from recipes
      const uniqueCategories = ['All', ...new Set(transformedItems.map(item => item.category))];
      setCategories(uniqueCategories);
      
      setMenuItems(transformedItems);
      setFilteredItems(transformedItems);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setError('Failed to load menu items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter menu items
  useEffect(() => {
    let filtered = menuItems;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [menuItems, selectedCategory, searchTerm]);

  // Calculate cart totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const discountAmount = (subtotal * discount) / 100;
  const totalAmount = subtotal + taxAmount - discountAmount;

  // Add item to cart
  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // Update item quantity
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Process order
  const processOrder = async () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    // Clear any previous errors
    clearError();
    setLoading(true);
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = subtotal * 0.05;
    const discountAmount = discount;
    const totalAmount = subtotal + taxAmount - discountAmount;
    
    try {
      // Validate customer mobile number
      if (!customerMobile || !/^[6-9]\d{9}$/.test(customerMobile)) {
        setError('Please enter a valid 10-digit Indian mobile number');
        return;
      }

      const orderData = {
        customerMobile: customerMobile,
        orderItems: cart.map(item => ({
          foodItemId: parseInt(item.id), // Ensure it's an integer
          quantity: parseInt(item.quantity) // Ensure it's an integer
        })),
        taxAmount: taxAmount,
        discountAmount: discountAmount,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod.toUpperCase(),
        paymentStatus: 'PAID',
        promoCode: promoCode || null
      };

      console.log('Cart items:', cart);
      console.log('Sending order data:', JSON.stringify(orderData, null, 2));

      // Save order to API
      try {
        const savedOrder = await createOrder(orderData, token);
        console.log('Order saved to API successfully:', savedOrder);
        
        // Use the saved order data from backend
        setCurrentOrder(savedOrder);
        clearCart();
        setCustomerMobile('');
        setPromoCode('');
        setDiscount(0);
        
        // Show print popup with real order data
        showPrintPopup(savedOrder);
      } catch (apiError) {
        console.error('Failed to save order to API:', apiError);
        setError(`Failed to process payment: ${apiError.message}`);
        return;
      }
      
    } catch (error) {
      console.error('Unexpected error processing order:', error);
      setError('Failed to process order. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  // Show print popup
  const showPrintPopup = (order) => {
    console.log('showPrintPopup called with order:', order);
    
    // Test if popup is blocked
    const printWindow = window.open('', '_blank', 'width=600,height=800,scrollbars=yes,resizable=yes');
    
    if (!printWindow || printWindow.closed || typeof printWindow.closed == 'undefined') {
      alert('Popup blocked! Please allow popups for this site and try again.');
      return;
    }
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill Receipt</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            margin: 0;
            padding: 10px;
            width: 3in;
            max-width: 3in;
            line-height: 1.2;
            font-size: 12px;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
          }
          .shop-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .address {
            font-size: 10px;
            margin-bottom: 2px;
          }
          .separator {
            text-align: center;
            margin: 8px 0;
            font-size: 10px;
          }
          .order-info {
            margin-bottom: 20px;
            font-size: 10px;
            text-align: center;
            margin: 2px 0;
          }
          .order-info p {
            margin: 5px 0;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            font-size: 10px;
          }
          .items-table th,
          .items-table td {
            padding: 2px 0;
            text-align: left;
          }
          .items-table th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          .total-section {
            margin-top: 10px;
            font-size: 10px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
          }
          .final-total {
            font-weight: bold;
            margin-top: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="shop-name">MEAL PREP SOCIAL</div>
          <div class="separator">********************</div>
          <div class="shop-name">CASH RECEIPT</div>
          <div class="separator">********************</div>
          ${order.id ? `<div class="order-info">Order #: ${order.id}</div>` : ''}
          ${order.customerMobile ? `<div class="order-info">Customer: ${order.customerMobile}</div>` : ''}
          <div class="order-info">Date: ${new Date().toLocaleString()}</div>
          <div class="separator">********************</div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${order.orderItems && order.orderItems.length > 0 ? order.orderItems.map(item => `
              <tr>
                <td>${item.itemName || item.name || 'Item'}</td>
                <td style="text-align: right;">₹{(item.itemTotal || (item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
              </tr>
            `).join('') : 'No items'}
          </tbody>
        </table>
        
        <div class="separator">********************</div>
        
        <div class="total-section">
          <div class="total-row">
            <span>Subtotal</span>
            <span>${(order.subtotal || (order.totalAmount - (order.taxAmount || 0) + (order.discountAmount || 0))).toFixed(2)}</span>
          </div>
          ${order.taxAmount && order.taxAmount > 0 ? `
          <div class="total-row">
            <span>Tax</span>
            <span>₹{order.taxAmount.toFixed(2)}</span>
          </div>
          ` : ''}
          ${order.discountAmount && order.discountAmount > 0 ? `
          <div class="total-row">
            <span>Discount</span>
            <span>-${order.discountAmount.toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="total-row">
            <span>Total</span>
            <span>${(order.totalAmount || order.total || 0).toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Payment Method</span>
            <span>${order.paymentMethod || 'CASH'}</span>
          </div>
          <div class="total-row">
            <span>Status</span>
            <span>${order.paymentStatus || 'PAID'}</span>
          </div>
        </div>
        
        <div class="separator">********************</div>
        
        <div class="header">
          <div class="shop-name">THANK YOU!</div>
        </div>
        
        <div class="footer">
          <p>Thank you for your visit!</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Auto print after a short delay
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };


  // Load menu items on component mount
  useEffect(() => {
    fetchMenuItems();
  }, []);

  return (
    <div className="pos-container">
      {/* Top Search Bar */}
      <div className="pos-top-bar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="pos-content">
        {/* Left Panel - Menu Items */}
        <div className="menu-panel">
          <div className="menu-header">
            <div className="category-filters">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="menu-items">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading menu items...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <p className="error-message">{error}</p>
                <button className="btn btn-primary" onClick={fetchMenuItems}>
                  Retry
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="empty-state">
                <Search size={32} color="#cbd5e0" />
                <h3>No Items Found</h3>
                <p>Try adjusting your search or category filter.</p>
              </div>
            ) : (
              <div className="menu-grid">
                {filteredItems.map(item => (
                  <div key={item.id} className="menu-item-card">
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="item-info">
                      <h3 className="item-name">{item.name}</h3>
                      <p className="item-price">₹{item.price.toFixed(2)}</p>
                    </div>
                    <button
                      className="add-to-cart-btn"
                      onClick={() => addToCart(item)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Cart and Order */}
        <div className="cart-panel">
          <div className="cart-header">
            <h3>My Order</h3>
          </div>

          <div className="cart-items">
            <div className="cart-items-header">
              <h4>Order Items ({cart.length})</h4>
            </div>
            {cart.length === 0 ? (
              <div className="empty-cart">
                <ShoppingCart size={32} color="#cbd5e0" />
                <p>Cart is empty</p>
                <p>Add items from the menu to get started</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <h4 className="item-name">{item.name}</h4>
                    <p className="item-price">₹{item.price.toFixed(2)}</p>
                  </div>
                  <div className="quantity-control">
                    <button
                      className="quantity-btn decrease-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={10} />
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      className="quantity-btn increase-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                  <div className="item-actions">
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="customer-info-section">
              <div className="customer-inputs">
                <div className="input-group">
                  <input
                    type="tel"
                    id="customerMobile"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="customer-input"
                    pattern="[6-9][0-9]{9}"
                    maxLength="10"
                    required
                  />
                  {customerMobile && !/^[6-9]\d{9}$/.test(customerMobile) && (
                    <small style={{color: 'red', fontSize: '12px'}}>
                      Please enter a valid 10-digit Indian mobile number
                    </small>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message" style={{color: 'red', padding: '10px', margin: '10px 0', backgroundColor: '#ffe6e6', borderRadius: '4px'}}>
              {error}
              <button onClick={clearError} style={{marginLeft: '10px', background: 'none', border: 'none', color: 'red', cursor: 'pointer'}}>
                ×
              </button>
            </div>
          )}

          {cart.length > 0 && (
            <div className="billing-section">
              <div className="order-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="summary-row">
                  <span>Tax (10%)</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="summary-row discount">
                    <span>Discount ({discount}%)</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="summary-row total">
                  <span>Total</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="payment-section">
                <div className="payment-options">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="payment-label">
                      <CreditCard size={14} />
                      CASH
                    </span>
                  </label>
                  
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="payment-label">
                      <Smartphone size={14} />
                      UPI
                    </span>
                  </label>
                  
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="payment-label">
                      <CreditCard size={14} />
                      CARD
                    </span>
                  </label>
                </div>
              </div>

              <button
                className="checkout-btn"
                onClick={processOrder}
                disabled={cart.length === 0 || loading}
              >
                Print Bills
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default POS;

