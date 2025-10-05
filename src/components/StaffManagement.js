import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User, Calendar, Clock, DollarSign, Briefcase, PieChart, TrendingUp, Receipt, Filter, CalendarDays } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/modals.css';
import '../styles/admin-components.css';

const StaffManagement = () => {
  const { token } = useAuth();
  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState(null);

  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [expensesError, setExpensesError] = useState(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseFormData, setExpenseFormData] = useState({
    category: '',
    amount: '',
    description: '',
    date: ''
  });

  // Date filtering state
  const [dateFilter, setDateFilter] = useState({
    type: 'all', // 'all', 'custom', 'currentMonth', 'currentYear', 'lastMonth', 'lastYear'
    startDate: '',
    endDate: ''
  });

  // Tooltip state
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

  // Fetch data on component mount
  useEffect(() => {
    fetchStaff();
    fetchExpenses();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    responsibility: '',
    offDay: '',
    restTime: '',
    salary: '',
    joiningDate: ''
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const openModal = (staff = null) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData(staff);
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        responsibility: '',
        offDay: '',
        restTime: '',
        salary: '',
        joiningDate: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
    setFormData({
      name: '',
      responsibility: '',
      offDay: '',
      restTime: '',
      salary: '',
      joiningDate: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingStaff) {
        // Update existing staff
        await updateStaff(editingStaff.id, formData);
      } else {
        // Add new staff
        await createStaff(formData);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving staff:', error);
      alert('Failed to save staff member. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteStaff(id);
      } catch (error) {
        console.error('Error deleting staff:', error);
        alert('Failed to delete staff member. Please try again.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // API Functions for Staff
  const fetchStaff = async () => {
    setStaffLoading(true);
    setStaffError(null);
    try {
      const response = await fetch('http://localhost:3002/staff', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Transform the API response to match the expected format
      const transformedStaff = data.map(member => ({
        id: member.id,
        name: member.name,
        responsibility: member.responsibility,
        offDay: member.offDay,
        restTime: member.restTime,
        salary: `₹${member.salary.toLocaleString()}`,
        joiningDate: new Date().toISOString().split('T')[0] // Default to today if not provided
      }));
      setStaff(transformedStaff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaffError('Failed to load staff. Please try again later.');
      setStaff([]);
    } finally {
      setStaffLoading(false);
    }
  };

  const createStaff = async (staffData) => {
    try {
      const response = await fetch('http://localhost:3002/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: staffData.name,
          responsibility: staffData.responsibility,
          offDay: staffData.offDay,
          restTime: staffData.restTime,
          salary: parseFloat(staffData.salary.replace(/[₹,]/g, '')),
          joiningDate: staffData.joiningDate
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newStaff = await response.json();
      // Transform and add to local state
      const transformedStaff = {
        id: newStaff.id,
        name: newStaff.name,
        responsibility: newStaff.responsibility,
        offDay: newStaff.offDay,
        restTime: newStaff.restTime,
        salary: `₹${newStaff.salary.toLocaleString()}`,
        joiningDate: newStaff.joiningDate || new Date().toISOString().split('T')[0]
      };
      setStaff(prev => [...prev, transformedStaff]);
      return transformedStaff;
    } catch (error) {
      console.error('Error creating staff:', error);
      throw error;
    }
  };

  const updateStaff = async (id, staffData) => {
    try {
      const response = await fetch(`http://localhost:3002/staff/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: staffData.name,
          responsibility: staffData.responsibility,
          offDay: staffData.offDay,
          restTime: staffData.restTime,
          salary: parseFloat(staffData.salary.replace(/[₹,]/g, '')),
          joiningDate: staffData.joiningDate
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedStaff = await response.json();
      // Transform and update local state
      const transformedStaff = {
        id: updatedStaff.id,
        name: updatedStaff.name,
        responsibility: updatedStaff.responsibility,
        offDay: updatedStaff.offDay,
        restTime: updatedStaff.restTime,
        salary: `₹${updatedStaff.salary.toLocaleString()}`,
        joiningDate: updatedStaff.joiningDate || new Date().toISOString().split('T')[0]
      };
      setStaff(prev => prev.map(member => 
        member.id === id ? transformedStaff : member
      ));
      return transformedStaff;
    } catch (error) {
      console.error('Error updating staff:', error);
      throw error;
    }
  };

  const deleteStaff = async (id) => {
    try {
      const response = await fetch(`http://localhost:3002/staff/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setStaff(prev => prev.filter(member => member.id !== id));
    } catch (error) {
      console.error('Error deleting staff:', error);
      throw error;
    }
  };

  // Expense Management Functions
  const openExpenseModal = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setExpenseFormData(expense);
    } else {
      setEditingExpense(null);
      setExpenseFormData({
        category: '',
        amount: '',
        description: ''
      });
    }
    setIsExpenseModalOpen(true);
  };

  const closeExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
    setExpenseFormData({
      category: '',
      amount: '',
      description: ''
    });
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, expenseFormData);
      } else {
        await createExpense(expenseFormData);
      }
      closeExpenseModal();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense. Please try again.');
    }
  };

  const handleExpenseDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense. Please try again.');
      }
    }
  };

  const handleExpenseInputChange = (e) => {
    const { name, value } = e.target;
    setExpenseFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // API Functions for Expenses
  const fetchExpenses = async () => {
    setExpensesLoading(true);
    setExpensesError(null);
    try {
      const response = await fetch('http://localhost:3002/expenses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Transform the API response to match the expected format
      const transformedExpenses = data.map(expense => ({
        id: expense.id,
        category: expense.category,
        amount: parseFloat(expense.amount),
        description: expense.description,
        date: expense.expenseDate || new Date().toISOString().split('T')[0]
      }));
      setExpenses(transformedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpensesError('Failed to load expenses. Please try again later.');
      setExpenses([]);
    } finally {
      setExpensesLoading(false);
    }
  };

  const createExpense = async (expenseData) => {
    try {
      const response = await fetch('http://localhost:3002/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category: expenseData.category,
          amount: expenseData.amount,
          description: expenseData.description
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newExpense = await response.json();
      // Transform and add to local state
      const transformedExpense = {
        id: newExpense.id,
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        description: newExpense.description,
        date: newExpense.expenseDate || new Date().toISOString().split('T')[0]
      };
      setExpenses(prev => [...prev, transformedExpense]);
      return transformedExpense;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      const response = await fetch(`http://localhost:3002/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category: expenseData.category,
          amount: expenseData.amount,
          description: expenseData.description
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedExpense = await response.json();
      // Transform and update local state
      const transformedExpense = {
        id: updatedExpense.id,
        category: updatedExpense.category,
        amount: parseFloat(updatedExpense.amount),
        description: updatedExpense.description,
        date: updatedExpense.expenseDate || new Date().toISOString().split('T')[0]
      };
      setExpenses(prev => prev.map(exp => 
        exp.id === id ? transformedExpense : exp
      ));
      return transformedExpense;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  };

  const deleteExpense = async (id) => {
    try {
      const response = await fetch(`http://localhost:3002/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setExpenses(prev => prev.filter(exp => exp.id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };

  // Date filtering functions
  const getDateRange = (type) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    switch (type) {
      case 'currentMonth':
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        return {
          startDate: firstDay.toISOString().split('T')[0],
          endDate: lastDay.toISOString().split('T')[0]
        };
      
      case 'currentYear':
        return {
          startDate: `${currentYear}-01-01`,
          endDate: `${currentYear}-12-31`
        };
      
      case 'lastMonth':
        const lastMonthFirst = new Date(currentYear, currentMonth - 1, 1);
        const lastMonthLast = new Date(currentYear, currentMonth, 0);
        return {
          startDate: lastMonthFirst.toISOString().split('T')[0],
          endDate: lastMonthLast.toISOString().split('T')[0]
        };
      
      case 'lastYear':
        return {
          startDate: `${currentYear - 1}-01-01`,
          endDate: `${currentYear - 1}-12-31`
        };
      
      default:
        return { startDate: '', endDate: '' };
    }
  };

  const filterExpensesByDate = (expenses, filter) => {
    if (filter.type === 'all') return expenses;
    
    let startDate, endDate;
    
    if (filter.type === 'custom') {
      startDate = filter.startDate;
      endDate = filter.endDate;
    } else {
      const range = getDateRange(filter.type);
      startDate = range.startDate;
      endDate = range.endDate;
    }
    
    if (!startDate || !endDate) return expenses;
    
    return expenses.filter(expense => {
      const expenseDate = expense.date;
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  };

  const handleDateFilterChange = (type, startDate = '', endDate = '') => {
    setDateFilter({ type, startDate, endDate });
  };

  const getFilteredExpenses = () => {
    return filterExpensesByDate(expenses, dateFilter);
  };

  // Get filtered expenses based on date filter
  const filteredExpenses = getFilteredExpenses();
  
  // Group expenses by category and calculate totals
  const groupedExpenses = filteredExpenses.reduce((groups, expense) => {
    const category = expense.category;
    if (!groups[category]) {
      groups[category] = {
        category: category,
        totalAmount: 0,
        count: 0,
        descriptions: [],
        expenses: []
      };
    }
    groups[category].totalAmount += expense.amount;
    groups[category].count += 1;
    groups[category].descriptions.push(expense.description);
    groups[category].expenses.push(expense);
    return groups;
  }, {});
  
  // Convert grouped expenses to array for display
  const groupedExpensesArray = Object.values(groupedExpenses);
  
  // Calculate total expenses (filtered)
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalStaffSalary = staff.reduce((sum, member) => {
    const salary = parseInt(member.salary.replace(/[₹,]/g, ''));
    return sum + salary;
  }, 0);

  // Calculate total cost (expenses + staff salaries)
  const totalCost = totalExpenses + totalStaffSalary;

  // Pie Chart Data - Include both expenses and staff salaries
  const pieChartData = [
    ...groupedExpensesArray.map(group => ({
      category: group.category,
      amount: group.totalAmount,
      percentage: ((group.totalAmount / totalCost) * 100).toFixed(1)
    })),
    {
      category: "Staff Salaries",
      amount: totalStaffSalary,
      percentage: ((totalStaffSalary / totalCost) * 100).toFixed(1)
    }
  ].filter(item => item.amount > 0); // Only show items with amount > 0

  // Tooltip handlers
  const handlePieSliceHover = (e, item) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setTooltip({
      show: true,
      text: `${item.category}: ₹${item.amount.toLocaleString()}`,
      x: centerX,
      y: centerY
    });
  };

  const handlePieSliceLeave = () => {
    setTooltip({ show: false, text: '', x: 0, y: 0 });
  };

  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c', 
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
  ];

  // Simple Pie Chart Component
  const PieChartComponent = () => {
    let cumulativePercentage = 0;
    
    // Debug: Log the pie chart data
    console.log('Pie Chart Data:', pieChartData);
    console.log('Total Cost:', totalCost);
    console.log('Total Expenses:', totalExpenses);
    console.log('Total Staff Salary:', totalStaffSalary);
    
    // If no data, show empty state
    if (pieChartData.length === 0 || totalCost === 0) {
      return (
        <div className="pie-chart-container">
          <div className="empty-chart">
            <PieChart size={34} color="#cbd5e0" />
            <p>No expense data available</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="pie-chart-container">
        <div className="pie-chart-wrapper">
          <svg width="150" height="150" className="pie-chart">
            {pieChartData.map((item, index) => {
              const percentage = parseFloat(item.percentage);
              if (percentage <= 0) return null; // Skip items with 0 or negative percentage
              
              const startAngle = (cumulativePercentage / 100) * 360;
              const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
              cumulativePercentage += percentage;
              
              const radius = 120;
              const centerX = 100;
              const centerY = 100;
              
              const startAngleRad = (startAngle - 90) * (Math.PI / 180);
              const endAngleRad = (endAngle - 90) * (Math.PI / 180);
              
              const x1 = centerX + radius * Math.cos(startAngleRad);
              const y1 = centerY + radius * Math.sin(startAngleRad);
              const x2 = centerX + radius * Math.cos(endAngleRad);
              const y2 = centerY + radius * Math.sin(endAngleRad);
              
              const largeArcFlag = percentage > 50 ? 1 : 0;
              
              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              return (
                <path
                  key={item.category}
                  d={pathData}
                  fill={colors[index % colors.length]}
                  stroke="white"
                  strokeWidth="1"
                  className="pie-slice"
                  onMouseEnter={(e) => handlePieSliceHover(e, item)}
                  onMouseLeave={handlePieSliceLeave}
                />
              );
            })}
          </svg>
          {tooltip.show && (
            <div 
              className="pie-chart-tooltip show"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {tooltip.text}
            </div>
          )}
        </div>
        
      </div>
    );
  };

  return (
    <div className="staff-management">
      <div className="staff-header">
        <div className="staff-title-section">
          <h1 className="staff-title">Staff Management</h1>
          <p className="staff-subtitle">Manage your hotel staff members</p>
        </div>
        <button 
          className="btn btn-primary btn-add-staff"
          onClick={() => openModal()}
        >
          <Plus size={20} />
          Add Staff
        </button>
      </div>

      <div className="staff-card">
        {staffLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading staff...</p>
          </div>
        )}
        
        {staffError && (
          <div className="error-container">
            <p className="error-message">{staffError}</p>
            <button 
              className="btn btn-primary" 
              onClick={fetchStaff}
            >
              Retry
            </button>
          </div>
        )}
        
        {!staffLoading && !staffError && (
          <div className="staff-table-container">
            {staff.length === 0 ? (
              <div className="empty-state">
                <User size={48} color="#cbd5e0" />
                <h3>No Staff Members</h3>
                <p>No staff members found. Add your first staff member to get started.</p>
                <button 
                  className="btn btn-primary" 
                  onClick={() => openModal()}
                >
                  <Plus size={20} />
                  Add First Staff Member
                </button>
              </div>
            ) : (
              <table className="staff-table">
                <thead>
                  <tr>
                    <th><User size={16} /> Name</th>
                    <th><Briefcase size={16} /> Responsibility</th>
                    <th><Calendar size={16} /> Off Day</th>
                    <th><Clock size={16} /> Rest Time</th>
                    <th><DollarSign size={16} /> Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map(member => (
                <tr key={member.id}>
                  <td>
                    <div className="staff-name">
                      <div className="staff-avatar">
                        {member.name.charAt(0)}
                      </div>
                      <span>{member.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="responsibility-badge">
                      {member.responsibility}
                    </span>
                  </td>
                  <td>
                    <span className="off-day">
                      {member.offDay}
                    </span>
                  </td>
                  <td>
                    <span className="rest-time">
                      {member.restTime}
                    </span>
                  </td>
                  <td>
                    <span className="salary">
                      {member.salary}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit"
                        onClick={() => openModal(member)}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(member.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Expenses Section */}
      <div className="expenses-section">
        <div className="expenses-header">
          <div className="expenses-title-section">
            <h2 className="expenses-title">Expense Management</h2>
            <p className="expenses-subtitle">Track and visualize your business expenses</p>
          </div>
          <div className="expenses-actions">
            <div className="date-filter-section">
              <div className="date-filter-controls">
                <div className="filter-group">
                  <label htmlFor="date-filter-type">Filter by:</label>
                  <select
                    id="date-filter-type"
                    value={dateFilter.type}
                    onChange={(e) => handleDateFilterChange(e.target.value)}
                    className="date-filter-select"
                  >
                    <option value="all">All Time</option>
                    <option value="currentMonth">Current Month</option>
                    <option value="currentYear">Current Year</option>
                    <option value="lastMonth">Last Month</option>
                    <option value="lastYear">Last Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                
                {dateFilter.type === 'custom' && (
                  <div className="custom-date-range">
                    <div className="date-input-group">
                      <label htmlFor="start-date">From:</label>
                      <input
                        type="date"
                        id="start-date"
                        value={dateFilter.startDate}
                        onChange={(e) => handleDateFilterChange('custom', e.target.value, dateFilter.endDate)}
                        className="date-input"
                      />
                    </div>
                    <div className="date-input-group">
                      <label htmlFor="end-date">To:</label>
                      <input
                        type="date"
                        id="end-date"
                        value={dateFilter.endDate}
                        onChange={(e) => handleDateFilterChange('custom', dateFilter.startDate, e.target.value)}
                        className="date-input"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button 
              className="btn btn-primary btn-add-expense"
              onClick={() => openExpenseModal()}
            >
              <Plus size={20} />
              Add Expense
            </button>
          </div>
        </div>

        <div className="expenses-content">
          {expensesLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading expenses...</p>
            </div>
          ) : expensesError ? (
            <div className="error-container">
              <p className="error-message">{expensesError}</p>
              <button 
                className="btn btn-primary" 
                onClick={fetchExpenses}
              >
                Retry
              </button>
            </div>
          ) : expenses.length === 0 ? (
            <div className="empty-state">
              <Receipt size={48} color="#cbd5e0" />
              <h3>No Expenses</h3>
              <p>No expenses found. Add your first expense to start tracking.</p>
              <button 
                className="btn btn-primary" 
                onClick={() => openExpenseModal()}
              >
                <Plus size={20} />
                Add First Expense
              </button>
            </div>
          ) : (
            <div className="expenses-data">
              <div className="expenses-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <Receipt size={24} />
              </div>
              <div className="stat-content">
                <h3>Total Expenses</h3>
                <p className="stat-amount">₹{totalExpenses.toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <h3>Staff Salaries</h3>
                <p className="stat-amount">₹{totalStaffSalary.toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <DollarSign size={24} />
              </div>
              <div className="stat-content">
                <h3>Total Cost</h3>
                <p className="stat-amount">₹{totalCost.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="expenses-chart-section">
            <div className="chart-container">
              <h2>Total Cost Distribution</h2>
              <h4>Expenses + Staff Salaries</h4>
              <PieChartComponent />
            </div>
            <div className="expenses-list">
              <h3>Expense Details</h3>
              <div className="expenses-table-container">
                <table className="expenses-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedExpensesArray.map((group, index) => (
                      <tr key={group.category}>
                        <td>
                          <span className="expense-category">
                            {group.category}
                            {group.count > 1 && (
                              <span className="expense-count">({group.count} entries)</span>
                            )}
                          </span>
                        </td>
                        <td>
                          <span className="expense-amount">
                            ₹{group.totalAmount.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <div className="expense-descriptions">
                            {group.descriptions.slice(0, 2).map((desc, idx) => (
                              <span key={idx} className="expense-description">
                                {desc}
                              </span>
                            ))}
                            {group.descriptions.length > 2 && (
                              <span className="expense-description-more">
                                +{group.descriptions.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-edit"
                              onClick={() => {
                                // Show first expense for editing (or could show a category edit modal)
                                if (group.expenses.length > 0) {
                                  openExpenseModal(group.expenses[0]);
                                }
                              }}
                              title="Edit Category"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="btn-delete"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete all ${group.count} ${group.category} expenses?`)) {
                                  group.expenses.forEach(expense => {
                                    handleExpenseDelete(expense.id);
                                  });
                                }
                              }}
                              title="Delete All in Category"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
          )}
        </div>
      </div>

      {/* Staff Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter staff name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="responsibility">Responsibility *</label>
                <input
                  type="text"
                  id="responsibility"
                  name="responsibility"
                  value={formData.responsibility}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Head Chef, Kitchen Assistant"
                />
              </div>

              <div className="form-group">
                <label htmlFor="offDay">Off Day *</label>
                <select
                  id="offDay"
                  name="offDay"
                  value={formData.offDay}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select off day</option>
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="restTime">Rest Time *</label>
                <input
                  type="text"
                  id="restTime"
                  name="restTime"
                  value={formData.restTime}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 2 PM – 4 PM"
                />
              </div>

              <div className="form-group">
                <label htmlFor="salary">Salary (₹/month) *</label>
                <input
                  type="text"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., ₹20,000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="joiningDate">Joining Date *</label>
                <input
                  type="date"
                  id="joiningDate"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingStaff ? 'Update Staff' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div className="modal-overlay" onClick={closeExpenseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
              <button className="modal-close" onClick={closeExpenseModal}>×</button>
            </div>
            
            <form onSubmit={handleExpenseSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="expense-category">Category *</label>
                <select
                  id="expense-category"
                  name="category"
                  value={expenseFormData.category}
                  onChange={handleExpenseInputChange}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Rent">Rent</option>
                  <option value="Ingredients">Ingredients</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="expense-amount">Amount (₹) *</label>
                <input
                  type="number"
                  id="expense-amount"
                  name="amount"
                  value={expenseFormData.amount}
                  onChange={handleExpenseInputChange}
                  required
                  placeholder="Enter amount"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="expense-description">Description *</label>
                <textarea
                  id="expense-description"
                  name="description"
                  value={expenseFormData.description}
                  onChange={handleExpenseInputChange}
                  required
                  placeholder="Enter expense description"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="expense-date">Date *</label>
                <input
                  type="date"
                  id="expense-date"
                  name="date"
                  value={expenseFormData.date}
                  onChange={handleExpenseInputChange}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeExpenseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
