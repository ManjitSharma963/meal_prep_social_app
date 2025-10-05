import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Calendar, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  Eye,
  Printer,
  Clock,
  User,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import '../styles/modals.css';
import '../styles/admin-components.css';

const OrdersView = () => {
  // State for orders data
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for filters
  const [selectedDate, setSelectedDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  
  // State for UI
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3002/pos/orders');
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const ordersData = await response.json();
      setOrders(ordersData);
      setFilteredOrders(ordersData);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on selected criteria
  useEffect(() => {
    let filtered = orders;

    // Filter by date
    if (selectedDate) {
      const filterDate = new Date(selectedDate);
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate || order.createdAt);
        return orderDate.toDateString() === filterDate.toDateString();
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.customerMobile?.includes(searchTerm) ||
        order.id?.toString().includes(searchTerm) ||
        order.orderItems?.some(item => 
          item.itemName?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by payment status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === statusFilter);
    }

    // Filter by payment method
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentMethod === paymentFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, selectedDate, searchTerm, statusFilter, paymentFilter]);

  // Load orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount?.toFixed(2) || '0.00'}`;
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return '#28a745';
      case 'PENDING': return '#ffc107';
      case 'FAILED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID': return <CheckCircle size={16} />;
      case 'PENDING': return <Clock size={16} />;
      case 'FAILED': return <XCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  // View order details
  const viewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  // Print order
  const printOrder = (order) => {
    const printWindow = window.open('', '_blank', 'width=600,height=800,scrollbars=yes,resizable=yes');
    
    if (!printWindow || printWindow.closed || typeof printWindow.closed == 'undefined') {
      alert('Popup blocked! Please allow popups for this site and try again.');
      return;
    }
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Receipt - ${order.id}</title>
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
          <div class="shop-name">ORDER RECEIPT</div>
          <div class="separator">********************</div>
          <div class="order-info">Order #: ${order.id}</div>
          <div class="order-info">Customer: ${order.customerMobile || 'N/A'}</div>
          <div class="order-info">Date: ${formatDate(order.orderDate || order.createdAt)}</div>
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
            ${order.orderItems ? order.orderItems.map(item => `
              <tr>
                <td>${item.itemName || 'Item'}</td>
                <td style="text-align: right;">₹${(item.itemTotal || 0).toFixed(2)}</td>
              </tr>
            `).join('') : ''}
          </tbody>
        </table>
        
        <div class="separator">********************</div>
        
        <div class="total-section">
          <div class="total-row">
            <span>Subtotal</span>
            <span>₹${(order.subtotal || (order.totalAmount - (order.taxAmount || 0) + (order.discountAmount || 0))).toFixed(2)}</span>
          </div>
          ${order.taxAmount && order.taxAmount > 0 ? `
          <div class="total-row">
            <span>Tax</span>
            <span>₹${order.taxAmount.toFixed(2)}</span>
          </div>
          ` : ''}
          ${order.discountAmount && order.discountAmount > 0 ? `
          <div class="total-row">
            <span>Discount</span>
            <span>-₹${order.discountAmount.toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="total-row">
            <span>Total</span>
            <span>₹${(order.totalAmount || order.total || 0).toFixed(2)}</span>
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

  return (
    <div className="orders-view-container">
      {/* Header */}
      <div className="orders-header">
        <div className="header-content">
          <h1>Orders & Bills</h1>
          <p>View and manage all orders and bills</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={fetchOrders}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
          <button className="btn btn-primary">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Search:</label>
          <div className="search-input-container">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by order ID, customer mobile, or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-group">
          <label>Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Payment:</label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Methods</option>
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="UPI">UPI</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      )}

      {/* Orders List */}
      {!loading && (
        <div className="orders-content">
          <div className="orders-summary">
            <h3>Orders Summary</h3>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Total Orders:</span>
                <span className="stat-value">{filteredOrders.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Revenue:</span>
                <span className="stat-value">
                  {formatCurrency(filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0))}
                </span>
              </div>
            </div>
          </div>

          <div className="orders-list">
            {filteredOrders.length === 0 ? (
              <div className="empty-state">
                <Receipt size={48} color="#cbd5e0" />
                <h3>No Orders Found</h3>
                <p>No orders match your current filters.</p>
              </div>
            ) : (
              <div className="orders-grid">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div className="order-id">Order #{order.id}</div>
                      <div 
                        className="order-status"
                        style={{ color: getStatusColor(order.paymentStatus) }}
                      >
                        {getStatusIcon(order.paymentStatus)}
                        {order.paymentStatus}
                      </div>
                    </div>

                    <div className="order-details">
                      <div className="order-info">
                        <div className="info-item">
                          <User size={14} />
                          <span>{order.customerMobile || 'Walk-in Customer'}</span>
                        </div>
                        <div className="info-item">
                          <Clock size={14} />
                          <span>{formatDate(order.orderDate || order.createdAt)}</span>
                        </div>
                        <div className="info-item">
                          <CreditCard size={14} />
                          <span>{order.paymentMethod || 'CASH'}</span>
                        </div>
                      </div>

                      <div className="order-items">
                        <div className="items-count">
                          {order.orderItems?.length || 0} items
                        </div>
                        <div className="items-preview">
                          {order.orderItems?.slice(0, 2).map((item, index) => (
                            <span key={index} className="item-name">
                              {item.itemName}
                              {index < Math.min(order.orderItems.length, 2) - 1 && ', '}
                            </span>
                          ))}
                          {order.orderItems?.length > 2 && (
                            <span className="more-items">+{order.orderItems.length - 2} more</span>
                          )}
                        </div>
                      </div>

                      <div className="order-total">
                        <span className="total-label">Total:</span>
                        <span className="total-amount">
                          {formatCurrency(order.totalAmount || order.total)}
                        </span>
                      </div>
                    </div>

                    <div className="order-actions">
                      <button 
                        className="btn btn-outline"
                        onClick={() => viewOrder(order)}
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button 
                        className="btn btn-primary"
                        onClick={() => printOrder(order)}
                      >
                        <Printer size={14} />
                        Print
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details - #{selectedOrder.id}</h2>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowOrderModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="order-details-section">
                <h3>Order Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Order ID:</label>
                    <span>#{selectedOrder.id}</span>
                  </div>
                  <div className="detail-item">
                    <label>Customer:</label>
                    <span>{selectedOrder.customerMobile || 'Walk-in Customer'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Date:</label>
                    <span>{formatDate(selectedOrder.orderDate || selectedOrder.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Payment Method:</label>
                    <span>{selectedOrder.paymentMethod || 'CASH'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span style={{ color: getStatusColor(selectedOrder.paymentStatus) }}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="order-items-section">
                <h3>Order Items</h3>
                <div className="items-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.orderItems?.map((item, index) => (
                        <tr key={index}>
                          <td>{item.itemName}</td>
                          <td>{item.quantity}</td>
                          <td>₹{((item.itemTotal || 0) / (item.quantity || 1)).toFixed(2)}</td>
                          <td>₹{(item.itemTotal || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="order-totals-section">
                <h3>Order Summary</h3>
                <div className="totals-grid">
                  <div className="total-row">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedOrder.subtotal || (selectedOrder.totalAmount - (selectedOrder.taxAmount || 0) + (selectedOrder.discountAmount || 0)))}</span>
                  </div>
                  {selectedOrder.taxAmount > 0 && (
                    <div className="total-row">
                      <span>Tax:</span>
                      <span>{formatCurrency(selectedOrder.taxAmount)}</span>
                    </div>
                  )}
                  {selectedOrder.discountAmount > 0 && (
                    <div className="total-row">
                      <span>Discount:</span>
                      <span>-{formatCurrency(selectedOrder.discountAmount)}</span>
                    </div>
                  )}
                  <div className="total-row final-total">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedOrder.totalAmount || selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-primary"
                onClick={() => printOrder(selectedOrder)}
              >
                <Printer size={16} />
                Print Receipt
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowOrderModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersView;
