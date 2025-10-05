import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Filter, 
  Download, 
  MoreHorizontal,
  Search
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import '../styles/modals.css';
import '../styles/admin-components.css';

const InventoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('products');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({
    name: '',
    productId: '',
    price: '',
    stock: '',
    unit: 'kg',
    type: 'Grains',
    status: 'In Stock'
  });

  const [editProduct, setEditProduct] = useState({
    name: '',
    productId: '',
    price: '',
    stock: '',
    unit: 'kg',
    type: 'Grains',
    status: 'In Stock'
  });

  // Load inventory items from API
  const loadInventoryItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No auth token found');
        setInventoryItems([]);
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3002/inventory/items', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const items = await response.json();
        console.log('Loaded inventory items:', items);
        setInventoryItems(items);
      } else {
        console.log('Failed to load inventory items');
        setInventoryItems([]);
      }
    } catch (error) {
      console.error('Error loading inventory items:', error);
      setInventoryItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Load items on component mount
  useEffect(() => {
    loadInventoryItems();
  }, []);

  // Inventory items state - starts empty, populated from API
  const [inventoryItems, setInventoryItems] = useState([]);

  // Helper function to convert API status to display format
  const getDisplayStatus = (status) => {
    if (!status) return 'N/A';
    switch (status) {
      case 'IN_STOCK':
      case 'In Stock':
        return 'In Stock';
      case 'LOW_IN_STOCK':
      case 'Low In Stock':
        return 'Low In Stock';
      case 'OUT_OF_STOCK':
      case 'Out Of Stock':
        return 'Out Of Stock';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    const displayStatus = getDisplayStatus(status);
    switch (displayStatus) {
      case 'In Stock': return '#10B981';
      case 'Low In Stock': return '#F59E0B';
      case 'Out Of Stock': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusBgColor = (status) => {
    const displayStatus = getDisplayStatus(status);
    switch (displayStatus) {
      case 'In Stock': return '#D1FAE5';
      case 'Low In Stock': return '#FEF3C7';
      case 'Out Of Stock': return '#FEE2E2';
      default: return '#F3F4F6';
    }
  };

  const handleDeleteItem = async (id) => {
    // Find the item to get its productId
    const itemToDelete = inventoryItems.find(item => item.id === id);
    if (!itemToDelete) {
      alert('Product not found');
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${itemToDelete.name}" (${itemToDelete.productId})?`)) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Please login first to delete inventory items');
          return;
        }

        // Use productId in the URL as per the cURL command
        const response = await fetch(`http://localhost:3002/inventory/items/product/${itemToDelete.productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setInventoryItems(inventoryItems.filter(item => item.id !== id));
          alert('Product deleted successfully!');
        } else {
          const errorData = await response.json().catch(() => ({}));
          alert(`Failed to delete product: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleEditItem = (id) => {
    // Find the item to edit
    const itemToEdit = inventoryItems.find(item => item.id === id);
    if (itemToEdit) {
      setEditingItem(itemToEdit);
      setEditProduct({
        name: itemToEdit.name || '',
        productId: itemToEdit.productId || '',
        price: itemToEdit.price || '',
        stock: itemToEdit.stock || '',
        unit: itemToEdit.unit || 'kg',
        type: itemToEdit.type || 'Grains',
        status: getDisplayStatus(itemToEdit.status) || 'In Stock'
      });
      setShowEditModal(true);
    }
  };

  const handleUpdateProduct = async () => {
    if (editProduct.name && editProduct.productId && editProduct.price && editProduct.stock && editingItem) {
      try {
        // Get the auth token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          alert('Please login first to update inventory items');
          return;
        }

        // Make API call using the provided cURL structure
        const response = await fetch(`http://localhost:3002/inventory/items/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: editProduct.name,
            productId: editProduct.productId,
            price: parseFloat(editProduct.price),
            stock: parseFloat(editProduct.stock),
            unit: editProduct.unit,
            type: editProduct.type,
            status: editProduct.status
          })
        });

        if (response.ok) {
          const updatedItem = await response.json();
          
          // Update the item in the local state
          setInventoryItems(inventoryItems.map(item => 
            item.id === editingItem.id ? updatedItem : item
          ));
          
          // Reset form and close modal
          setEditProduct({
            name: '',
            productId: '',
            price: '',
            stock: '',
            unit: 'kg',
            type: 'Grains',
            status: 'In Stock'
          });
          setEditingItem(null);
          setShowEditModal(false);
          
          // Show success message
          alert('Product updated successfully!');
        } else {
          const errorData = await response.json().catch(() => ({}));
          alert(`Failed to update product: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error updating product:', error);
        alert('Failed to update product. Please try again.');
      }
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleAddProduct = async () => {
    if (newProduct.name && newProduct.productId && newProduct.price && newProduct.stock) {
      try {
        // Get the auth token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          alert('Please login first to add inventory items');
          return;
        }

        // Make API call using the provided cURL structure
        const response = await fetch('http://localhost:3002/inventory/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: newProduct.name,
            productId: newProduct.productId,
            price: parseFloat(newProduct.price),
            stock: parseFloat(newProduct.stock),
            unit: newProduct.unit,
            type: newProduct.type,
            status: newProduct.status
          })
        });

        if (response.ok) {
          const addedItem = await response.json();
          
          // Add the new item to the local state
          setInventoryItems([...inventoryItems, {
            id: addedItem.id || Math.max(...inventoryItems.map(item => item.id)) + 1,
            ...addedItem,
            price: parseFloat(addedItem.price),
            stock: parseFloat(addedItem.stock)
          }]);
          
          // Reset form
          setNewProduct({
            name: '',
            productId: '',
            price: '',
            stock: '',
            unit: 'kg',
            type: 'Grains',
            status: 'In Stock'
          });
          
          // Close modal
          setShowAddModal(false);
          
          // Show success message
          alert('Product added successfully!');
        } else {
          const errorData = await response.json().catch(() => ({}));
          alert(`Failed to add product: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error adding product:', error);
        alert('Failed to add product. Please try again.');
      }
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredItems = inventoryItems.filter(item => {
    const matches = (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.type && item.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.productId && item.productId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matches && searchTerm) {
      console.log('Item filtered out:', item.name, 'searchTerm:', searchTerm);
    }
    return matches;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return `₹${numAmount.toFixed(2)}`;
  };

  // Report calculations
  const getReportData = () => {
    const totalItems = inventoryItems.length;
    const inStockItems = inventoryItems.filter(item => 
      item && (item.status === 'In Stock' || item.status === 'IN_STOCK')
    );
    const lowStockItems = inventoryItems.filter(item => 
      item && (item.status === 'Low In Stock' || item.status === 'LOW_IN_STOCK')
    );
    const outOfStockItems = inventoryItems.filter(item => 
      item && (item.status === 'Out Of Stock' || item.status === 'OUT_OF_STOCK')
    );

    const inStockCost = inStockItems.reduce((total, item) => {
      const price = item.price || 0;
      const stock = item.stock || 0;
      return total + (price * stock);
    }, 0);
    
    const lowStockCost = lowStockItems.reduce((total, item) => {
      const price = item.price || 0;
      const stock = item.stock || 0;
      return total + (price * stock);
    }, 0);
    
    const outOfStockCost = outOfStockItems.reduce((total, item) => {
      const price = item.price || 0;
      const stock = item.stock || 0;
      return total + (price * stock);
    }, 0);
    
    const totalCost = inventoryItems.reduce((total, item) => {
      const price = item.price || 0;
      const stock = item.stock || 0;
      return total + (price * stock);
    }, 0);

    const typeBreakdown = inventoryItems.reduce((acc, item) => {
      if (item && item.type) {
        if (!acc[item.type]) {
          acc[item.type] = { count: 0, cost: 0 };
        }
        acc[item.type].count += 1;
        const price = item.price || 0;
        const stock = item.stock || 0;
        acc[item.type].cost += price * stock;
      }
      return acc;
    }, {});

    return {
      totalItems,
      inStockItems: inStockItems.length,
      lowStockItems: lowStockItems.length,
      outOfStockItems: outOfStockItems.length,
      inStockCost,
      lowStockCost,
      outOfStockCost,
      totalCost,
      typeBreakdown
    };
  };

  const reportData = getReportData();

  return (
    <div className="simple-inventory">
      {/* Header */}
      <div className="inventory-header">
        <div className="header-left">
          <h1 className="page-title">Inventory Management</h1>
        </div>
        <div className="header-right">
          {activeTab === 'products' && (
            <button className="add-btn" onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
              Add New Product
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="inventory-tabs">
        <button 
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Search size={18} />
          Products
        </button>
        <button 
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <Download size={18} />
          Reports
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <>
          {/* Search Bar */}
          <div className="search-section">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* Products Table */}
          <div className="products-table">
        <div className="table-header">
          <div className="table-cell">Product Name</div>
          <div className="table-cell">Product ID</div>
          <div className="table-cell">Price</div>
          <div className="table-cell">Stock</div>
          <div className="table-cell">Type</div>
          <div className="table-cell">Status</div>
          <div className="table-cell">Action</div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading inventory items...</p>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No inventory items found</h3>
            <p>Start by adding your first product to the inventory.</p>
            <button 
              className="add-first-btn"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} />
              Add First Product
            </button>
          </div>
        ) : (
          currentItems.map(item => (
            <div key={item.id} className="table-row">
              <div className="table-cell product-name">
                <div className="product-info">
                  <div className="product-icon">
                    {item.type === 'Grains' ? (
      <img 
        src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" 
        alt="Grains"
        className="product-icon-img"
      />
    ) : 
                       item.type === 'Vegetables' ? (
                        <img 
                          src="https://i.pinimg.com/736x/f7/6a/26/f76a264bf889fccd255d89565e9eeb49.jpg" 
                          alt="Vegetables"
                          className="product-icon-img"
                        />
                      ) : 
                       item.type === 'Spices' ? (
                        <img 
                          src="https://i.pinimg.com/1200x/26/41/36/2641361405ddf2f9fe6f8077f51ae1e1.jpg" 
                          alt="Spices"
                          className="product-icon-img"
                        />
                      ) : 
                       item.type === 'Dairy' ? (
                        <img 
                          src="https://i.pinimg.com/736x/d6/36/ac/d636acf9ff4ff829a38c27f965ef254c.jpg" 
                          alt="Dairy"
                          className="product-icon-img"
                        />
                      ) : 
                       item.type === 'Cooking Essentials' ? (
                        <img 
                          src="https://i.pinimg.com/736x/d8/76/85/d8768525cbe4a5131cd77bf0b11065b2.jpg" 
                          alt="Dairy"
                          className="product-icon-img"
                        />
                      ) : '📦'}
                  </div>
                  
                  <span>{item.name || 'N/A'}</span>
                </div>
              </div>
              <div className="table-cell">{item.productId || 'N/A'}</div>
              <div className="table-cell">{formatCurrency(item.price)}</div>
              <div className="table-cell">
                <span className="stock-value">{item.stock || 0}</span>
                <span className="stock-unit">{item.unit || 'N/A'}</span>
              </div>
              <div className="table-cell">{item.type || 'N/A'}</div>
              <div className="table-cell">
                <span 
                  className="status-badge"
                  style={{ 
                    backgroundColor: getStatusBgColor(item.status),
                    color: getStatusColor(item.status)
                  }}
                >
                  {getDisplayStatus(item.status)}
                </span>
              </div>
              <div className="table-cell">
                <div className="action-buttons">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => handleEditItem(item.id)}
                    title="Edit Product"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteItem(item.id)}
                    title="Delete Product"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button 
          className="pagination-btn"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          &lt; Previous
        </button>
        
        <div className="page-numbers">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {String(pageNum).padStart(2, '0')}
              </button>
            );
          })}
          {totalPages > 5 && (
            <>
              <span className="page-dots">...</span>
              <button
                className={`page-btn ${currentPage === totalPages ? 'active' : ''}`}
                onClick={() => setCurrentPage(totalPages)}
              >
                {String(totalPages).padStart(2, '0')}
              </button>
            </>
          )}
        </div>
      </div>
        </>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="reports-content">
          <div className="reports-header">
            <h2 className="reports-title">Inventory Reports</h2>
            <p className="reports-subtitle">Cost analysis and item statistics</p>
          </div>

          {/* Summary Cards */}
          <div className="reports-summary">
            <div className="summary-card">
              <div className="card-icon">📦</div>
              <div className="card-content">
                <h3>Total Items</h3>
                <div className="card-value">{reportData.totalItems}</div>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon">✅</div>
              <div className="card-content">
                <h3>In Stock</h3>
                <div className="card-value">{reportData.inStockItems}</div>
                <div className="card-cost">{formatCurrency(reportData.inStockCost)}</div>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon">⚠️</div>
              <div className="card-content">
                <h3>Low Stock</h3>
                <div className="card-value">{reportData.lowStockItems}</div>
                <div className="card-cost">{formatCurrency(reportData.lowStockCost)}</div>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon">❌</div>
              <div className="card-content">
                <h3>Out of Stock</h3>
                <div className="card-value">{reportData.outOfStockItems}</div>
                <div className="card-cost">{formatCurrency(reportData.outOfStockCost)}</div>
              </div>
            </div>
          </div>

          {/* Cost Analysis */}
          <div className="cost-analysis">
            <h3 className="section-title">Cost Analysis</h3>
            <div className="cost-breakdown">
              <div className="cost-item">
                <span className="cost-label">Total Inventory Value:</span>
                <span className="cost-value">{formatCurrency(reportData.totalCost)}</span>
              </div>
              <div className="cost-item">
                <span className="cost-label">In Stock Value:</span>
                <span className="cost-value in-stock">{formatCurrency(reportData.inStockCost)}</span>
              </div>
              <div className="cost-item">
                <span className="cost-label">Low Stock Value:</span>
                <span className="cost-value low-stock">{formatCurrency(reportData.lowStockCost)}</span>
              </div>
              <div className="cost-item">
                <span className="cost-label">Out of Stock Value:</span>
                <span className="cost-value out-stock">{formatCurrency(reportData.outOfStockCost)}</span>
              </div>
            </div>
          </div>

          {/* Type Breakdown */}
          <div className="type-breakdown">
            <h3 className="section-title">Items by Type</h3>
            <div className="type-grid">
              {Object.entries(reportData.typeBreakdown).map(([type, data]) => (
                <div key={type} className="type-card">
                  <div className="type-header">
                    <h4>{type}</h4>
                    <span className="type-count">{data.count} items</span>
                  </div>
                  <div className="type-cost">{formatCurrency(data.cost)}</div>
                  <div className="type-percentage">
                    {((data.cost / reportData.totalCost) * 100).toFixed(1)}% of total value
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Product</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={newProduct.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Product ID</label>
                <input
                  type="text"
                  name="productId"
                  value={newProduct.productId}
                  onChange={handleInputChange}
                  placeholder="Enter product ID (e.g., #PR001)"
                  className="form-input"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={newProduct.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="form-input"
                    step="0.01"
                  />
                </div>
                
                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={newProduct.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="form-input"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Unit</label>
                  <select
                    name="unit"
                    value={newProduct.unit}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="kg">kg</option>
                    <option value="liter">liter</option>
                    <option value="pcs">pcs</option>
                    <option value="packet">packet</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Type</label>
                  <select
                    name="type"
                    value={newProduct.type}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="Grains">Grains</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Spices">Spices</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Cooking Essentials">Cooking Essentials</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={newProduct.status}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Low In Stock">Low In Stock</option>
                  <option value="Out Of Stock">Out Of Stock</option>
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-save"
                onClick={handleAddProduct}
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Product</h2>
              <button 
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={editProduct.name}
                  onChange={handleEditInputChange}
                  placeholder="Enter product name"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Product ID</label>
                <input
                  type="text"
                  name="productId"
                  value={editProduct.productId}
                  onChange={handleEditInputChange}
                  placeholder="Enter product ID (e.g., #PR001)"
                  className="form-input"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={editProduct.price}
                    onChange={handleEditInputChange}
                    placeholder="0.00"
                    className="form-input"
                    step="0.01"
                    min="0"
                  />
                </div>
                
                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={editProduct.stock}
                    onChange={handleEditInputChange}
                    placeholder="0.00"
                    className="form-input"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Unit</label>
                  <select
                    name="unit"
                    value={editProduct.unit}
                    onChange={handleEditInputChange}
                    className="form-input"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="liter">liter</option>
                    <option value="ml">ml</option>
                    <option value="piece">piece</option>
                    <option value="packet">packet</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Type</label>
                  <select
                    name="type"
                    value={editProduct.type}
                    onChange={handleEditInputChange}
                    className="form-input"
                  >
                    <option value="Grains">Grains</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Spices">Spices</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Cooking Essentials">Cooking Essentials</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={editProduct.status}
                  onChange={handleEditInputChange}
                  className="form-input"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Low In Stock">Low In Stock</option>
                  <option value="Out Of Stock">Out Of Stock</option>
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-save"
                onClick={handleUpdateProduct}
              >
                Update Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
