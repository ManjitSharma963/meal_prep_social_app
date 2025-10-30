import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchOrders } from '../utils/api';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download, 
  Filter,
  RefreshCw,
  DollarSign,
  ShoppingCart,
  Clock,
  Target,
  AlertCircle,
  Search
} from 'lucide-react';
import '../styles/admin-components.css';

const SalesReports = () => {
  const { token } = useAuth();
  
  // State for date filters
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // State for sales data
  const [salesData, setSalesData] = useState(null);
  const [itemAnalytics, setItemAnalytics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for UI
  const [activeTab, setActiveTab] = useState('overview');

  // Get date range based on selected period
  const getDateRange = () => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    switch (selectedPeriod) {
      case 'today':
        return {
          startDate: startOfDay,
          endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        };
      case 'yesterday':
        const yesterday = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000);
        return {
          startDate: yesterday,
          endDate: startOfDay
        };
      case 'week':
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
        return {
          startDate: startOfWeek,
          endDate: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
        };
      case 'month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return {
          startDate: startOfMonth,
          endDate: endOfMonth
        };
      case 'custom':
        return {
          startDate: customStartDate ? new Date(customStartDate) : null,
          endDate: customEndDate ? new Date(customEndDate) : null
        };
      default:
        return {
          startDate: startOfDay,
          endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        };
    }
  };

  // Fetch sales data from API
  const fetchSalesData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { startDate, endDate } = getDateRange();
      
      if (!startDate || !endDate) {
        setError('Please select valid date range');
        return;
      }

      // Format dates for API
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Fetch all orders from the API
      const allOrders = await fetchOrders(token);

      // Filter orders by date range on the frontend
      console.log('Date range:', { startDate, endDate });
      const orders = allOrders.filter(order => {
        // Try multiple date fields and handle different formats
        const orderDateData = order.orderDate || order.createdAt || order.date;
        if (!orderDateData) {
          console.log('No date found for order:', order);
          return false;
        }
        
        let orderDate;
        if (Array.isArray(orderDateData)) {
          // Handle array format [year, month, day, hour, minute, second, nanosecond]
          const [year, month, day, hour, minute, second] = orderDateData;
          orderDate = new Date(year, month - 1, day, hour, minute, second || 0);
          console.log('Order date array:', orderDateData, 'Parsed date:', orderDate, 'Order data:', order);
        } else {
          orderDate = new Date(orderDateData);
          console.log('Order date string:', orderDateData, 'Parsed date:', orderDate, 'Order data:', order);
        }
        
        // Check if date is valid
        if (isNaN(orderDate.getTime())) {
          console.log('Invalid date for order:', order);
          return false;
        }
        
        // Use date comparison (ignore time for date-only comparison)
        const orderDateOnly = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        
        const isInRange = orderDateOnly >= startDateOnly && orderDateOnly < endDateOnly;
        console.log('Date comparison:', { orderDateOnly, startDateOnly, endDateOnly, isInRange });
        return isInRange;
      });
      console.log('Filtered orders:', orders);
      
      // If no orders found in date range, show all orders as fallback
      const ordersToProcess = orders.length > 0 ? orders : allOrders;
      console.log('Orders to process:', ordersToProcess);
      
      // Process sales data
      const processedData = processSalesData(ordersToProcess);
      setSalesData(processedData);
      
      // Process item analytics
      const itemData = processItemAnalytics(ordersToProcess);
      console.log('Setting itemAnalytics to:', itemData);
      setItemAnalytics(itemData);
      
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setError('Failed to load sales data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Process raw orders into sales summary
  const processSalesData = (orders) => {
    console.log(orders)
    const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    // Payment method breakdown
    const paymentBreakdown = orders.reduce((acc, order) => {
      const method = order.paymentMethod || 'UNKNOWN';
      acc[method] = (acc[method] || 0) + (order.totalAmount || 0);
      return acc;
    }, {});

    // Daily breakdown for charts
    const dailyBreakdown = orders.reduce((acc, order) => {
      const orderDateData = order.orderDate || order.createdAt || order.date;
      let orderDate;
      
      if (Array.isArray(orderDateData)) {
        // Handle array format [year, month, day, hour, minute, second, nanosecond]
        const [year, month, day, hour, minute, second] = orderDateData;
        orderDate = new Date(year, month - 1, day, hour, minute, second || 0);
      } else {
        orderDate = new Date(orderDateData);
      }
      
      // Check if date is valid before processing
      if (isNaN(orderDate.getTime())) {
        console.warn('Invalid date found in order:', order);
        return acc;
      }
      
      const date = orderDate.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + (order.totalAmount || 0);
      return acc;
    }, {});

    return {
      totalSales,
      totalOrders,
      averageOrderValue,
      paymentBreakdown,
      dailyBreakdown,
      orders
    };
  };

  // Process item-wise analytics
  const processItemAnalytics = (orders) => {
    console.log('Processing item analytics for orders:', orders);
    const itemMap = new Map();
    
    orders.forEach(order => {
      console.log('Processing order:', order);
      if (order.orderItems && order.orderItems.length > 0) {
        console.log('Order has orderItems:', order.orderItems);
        order.orderItems.forEach(item => {
          console.log('Processing orderItem:', item);
          const itemName = item.recipe?.title || item.itemName || 'Unknown Item';
          const quantity = item.quantity || 0;
          const itemTotal = item.itemTotal || 0;
          
          console.log('Processing item:', { itemName, quantity, itemTotal, item });
          
          if (itemMap.has(itemName)) {
            const existing = itemMap.get(itemName);
            existing.quantity += quantity;
            existing.revenue += itemTotal;
            existing.orders += 1;
          } else {
            itemMap.set(itemName, {
              name: itemName,
              quantity: quantity,
              revenue: itemTotal,
              orders: 1
            });
          }
        });
      } else {
        // If no orderItems, create a generic item entry
        console.log('Order has no orderItems, creating generic item for order:', order);
        const totalAmount = order.totalAmount || 0;
        const genericItem = {
          name: 'Order #' + (order.id || 'Unknown'),
          quantity: 1,
          revenue: totalAmount,
          orders: 1
        };
        
        if (itemMap.has(genericItem.name)) {
          const existing = itemMap.get(genericItem.name);
          existing.quantity += 1;
          existing.revenue += totalAmount;
          existing.orders += 1;
        } else {
          itemMap.set(genericItem.name, genericItem);
        }
      }
    });

    const result = Array.from(itemMap.values())
      .sort((a, b) => b.quantity - a.quantity);
    
    console.log('Final item analytics result:', result);
    return result;
  };

  // Load data on component mount and when period changes
  useEffect(() => {
    if (selectedPeriod !== 'custom' || (customStartDate && customEndDate)) {
      fetchSalesData();
    }
  }, [selectedPeriod, customStartDate, customEndDate]);

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  // Get period label
  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'today': return 'Today';
      case 'yesterday': return 'Yesterday';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'custom': return 'Custom Range';
      default: return 'Today';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Sales Dashboard</h1>
          <div className="date-filter">
            <Calendar size={16} />
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="period-select"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>
      </div>

      {/* Custom Date Filters */}
      {selectedPeriod === 'custom' && (
        <div className="custom-date-section">
          <div className="date-inputs">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="date-input"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="date-input"
              placeholder="End Date"
            />
          </div>
        </div>
      )}

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
          <p>Loading sales data...</p>
        </div>
      )}

      {/* Dashboard Content */}
      {salesData && (
        <div className="dashboard-content">
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card total-sales">
              <div className="card-header">
                <h3>Total Sales</h3>
                <div className="card-icon">💰</div>
              </div>
              <div className="card-value">{formatCurrency(salesData.totalSales)}</div>
              <div className="card-change positive">
                <TrendingUp size={12} />
                12.1% vs last month
              </div>
            </div>

            <div className="summary-card cash-sales">
              <div className="card-header">
                <h3>Cash Sales</h3>
                <div className="card-icon">💵</div>
              </div>
              <div className="card-value">{formatCurrency(salesData.paymentBreakdown.CASH || 0)}</div>
              <div className="card-change positive">
                <TrendingUp size={12} />
                6.3% vs last month
              </div>
            </div>

            <div className="summary-card upi-sales">
              <div className="card-header">
                <h3>UPI Sales</h3>
                <div className="card-icon">📱</div>
              </div>
              <div className="card-value">{formatCurrency(salesData.paymentBreakdown.UPI || 0)}</div>
              <div className="card-change positive">
                <TrendingUp size={12} />
                8.2% vs last month
              </div>
            </div>

            <div className="summary-card card-sales">
              <div className="card-header">
                <h3>Card Sales</h3>
                <div className="card-icon">💳</div>
              </div>
              <div className="card-value">{formatCurrency(salesData.paymentBreakdown.CARD || 0)}</div>
              <div className="card-change positive">
                <TrendingUp size={12} />
                4.5% vs last month
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            {/* Item Flow Chart */}
            <div className="chart-widget item-flow-chart">
              <div className="chart-header">
                <h3>Item Flow</h3>
                <div className="chart-controls">
                  <select className="chart-select">
                    <option>All Items</option>
                    <option>Top 10</option>
                    <option>Top 5</option>
                  </select>
                  <select className="chart-select">
                    <option>This Month</option>
                    <option>This Week</option>
                    <option>Today</option>
                  </select>
                </div>
              </div>
              <div className="chart-content">
                <div className="vertical-bar-chart">
                  <div className="chart-bars">
                    {console.log('Rendering itemAnalytics:', itemAnalytics)}
                    {itemAnalytics.map((item, index) => {
                      console.log('Rendering item:', item);
                      const maxQuantity = Math.max(...itemAnalytics.map(i => i.quantity));
                      const percentage = maxQuantity > 0 ? (item.quantity / maxQuantity) * 100 : 0;
                      return (
                        <div key={index} className="vertical-bar-item">
                          <div 
                            className="vertical-bar" 
                            style={{ height: `${percentage}%` }}
                            title={`${item.name}: ${item.quantity} sold`}
                          >
                            <span className="bar-value">{item.quantity}</span>
                          </div>
                          <div className="bar-label">{item.name.length > 8 ? item.name.substring(0, 8) + '...' : item.name}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Selling Items */}
            <div className="chart-widget top-items-chart">
              <div className="chart-header">
                <h3>Top Selling Items</h3>
              </div>
              <div className="chart-content">
                <div className="items-progress">
                  {itemAnalytics.slice(0, 5).map((item, index) => {
                    const maxQuantity = Math.max(...itemAnalytics.slice(0, 5).map(i => i.quantity));
                    const percentage = maxQuantity > 0 ? (item.quantity / maxQuantity) * 100 : 0;
                    return (
                      <div key={index} className="item-progress">
                        <div className="progress-container">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="progress-value">{item.quantity}</span>
                        </div>
                        <span className="item-name">{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="bottom-section">
            {/* All Bills - Redesigned */}
            <div className="widget modern-bills">
              <div className="widget-header">
                <div className="header-left">
                  <h3>All Bills</h3>
                  <span className="bill-count">{salesData.orders.length} transactions</span>
                </div>
                <div className="widget-controls">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Search bills..."
                      className="search-input"
                    />
                    <Search size={16} />
                  </div>
                  <select className="widget-select">
                    <option>All Orders</option>
                    <option>Today</option>
                    <option>This Week</option>
                    <option>This Month</option>
                  </select>
                  <select className="widget-select">
                    <option>All Methods</option>
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Card</option>
                  </select>
                </div>
              </div>
              
              <div className="widget-content">
                <div className="modern-bills-table">
                  <div className="table-header">
                    <div className="table-cell">Order ID</div>
                    <div className="table-cell">Date & Time</div>
                    <div className="table-cell">Customer</div>
                    <div className="table-cell">Amount</div>
                    <div className="table-cell">Payment Method</div>
                    <div className="table-cell">Status</div>
                    <div className="table-cell">Actions</div>
                  </div>
                  
                  <div className="table-body">
                    {salesData.orders.map((order, index) => (
                      <div key={index} className="modern-table-row">
                        <div className="table-cell order-id-cell">
                          <div className="order-id">
                            <span className="id-number">#{order.id || (index + 1).toString().padStart(3, '0')}</span>
                          </div>
                        </div>
                        
                        
                        
                        <div className="table-cell customer-cell">
                          <div className="customer-info">
                            <div className="customer-avatar">
                              {order.customerMobile ? order.customerMobile.charAt(0).toUpperCase() : 'W'}
                            </div>
                            <div className="customer-details">
                              <span className="customer-name">
                                {order.customerMobile ? `+${order.customerMobile}` : 'Walk-in Customer'}
                              </span>
                              <span className="customer-type">
                                {order.customerMobile ? 'Registered' : 'Guest'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="table-cell amount-cell">
                          <div className="amount-display">
                            <span className="amount-value">₹{(order.totalAmount || 0).toFixed(2)}</span>
                            <span className="amount-label">Total</span>
                          </div>
                        </div>
                        
                        <div className="table-cell method-cell">
                          <div className={`payment-method ${order.paymentMethod?.toLowerCase()}`}>
                            <div className="method-icon">
                              {order.paymentMethod === 'CASH' ? '💵' : 
                               order.paymentMethod === 'UPI' ? '📱' : 
                               order.paymentMethod === 'CARD' ? '💳' : '❓'}
                            </div>
                            <span className="method-name">{order.paymentMethod || 'Unknown'}</span>
                          </div>
                        </div>
                        
                        <div className="table-cell status-cell">
                          <div className={`status-indicator ${order.paymentStatus?.toLowerCase()}`}>
                            <div className="status-dot"></div>
                            <span className="status-text">{order.paymentStatus || 'Unknown'}</span>
                          </div>
                        </div>
                        
                        <div className="table-cell actions-cell">
                          <div className="action-buttons">
                            <button className="action-btn view-btn" title="View Details">
                              <BarChart3 size={14} />
                            </button>
                            <button className="action-btn print-btn" title="Print Bill">
                              <Download size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="table-cell date-cell">
                          <div className="date-info">
                            <div className="date">
                              {(() => {
                                try {
                                  let date;
                                  if (Array.isArray(order.orderDate)) {
                                    const [year, month, day, hour, minute, second] = order.orderDate;
                                    date = new Date(year, month - 1, day, hour, minute, second || 0);
                                  } else {
                                    date = new Date(order.orderDate);
                                  }
                                  
                                  if (isNaN(date.getTime())) {
                                    return 'Invalid Date';
                                  }
                                  
                                  return date.toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: '2-digit'
                                  });
                                } catch (error) {
                                  console.error('Date parsing error:', error, order.orderDate);
                                  return 'Invalid Date';
                                }
                              })()}
                            </div>
                            <div className="time">
                              {(() => {
                                try {
                                  let date;
                                  if (Array.isArray(order.orderDate)) {
                                    const [year, month, day, hour, minute, second] = order.orderDate;
                                    date = new Date(year, month - 1, day, hour, minute, second || 0);
                                  } else {
                                    date = new Date(order.orderDate);
                                  }
                                  
                                  if (isNaN(date.getTime())) {
                                    return '--:--';
                                  }
                                  
                                  return date.toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  });
                                } catch (error) {
                                  return '--:--';
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Pagination */}
                <div className="table-pagination">
                  <div className="pagination-info">
                    Showing 1-{salesData.orders.length} of {salesData.orders.length} bills
                  </div>
                  <div className="pagination-controls">
                    <button className="pagination-btn" disabled>
                      <span>←</span>
                    </button>
                    <button className="pagination-btn active">1</button>
                    <button className="pagination-btn" disabled>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesReports;
