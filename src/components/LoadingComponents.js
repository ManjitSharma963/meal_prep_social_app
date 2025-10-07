/**
 * Comprehensive loading components and skeleton screens
 */

import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import '../styles/loading.css';

/**
 * Basic loading spinner
 */
export const LoadingSpinner = ({ size = 24, className = '' }) => (
  <div className={`loading-spinner ${className}`}>
    <Loader2 size={size} className="animate-spin" />
  </div>
);

/**
 * Loading overlay for modals and forms
 */
export const LoadingOverlay = ({ message = 'Loading...', show = true }) => {
  if (!show) return null;
  
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <LoadingSpinner size={32} />
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

/**
 * Button loading state
 */
export const LoadingButton = ({ 
  loading = false, 
  children, 
  loadingText = 'Loading...', 
  className = '',
  ...props 
}) => (
  <button 
    className={`btn ${loading ? 'btn-loading' : ''} ${className}`}
    disabled={loading}
    {...props}
  >
    {loading ? (
      <>
        <LoadingSpinner size={16} />
        <span>{loadingText}</span>
      </>
    ) : (
      children
    )}
  </button>
);

/**
 * Skeleton text line
 */
export const SkeletonText = ({ 
  width = '100%', 
  height = '1rem', 
  className = '' 
}) => (
  <div 
    className={`skeleton-text ${className}`}
    style={{ width, height }}
  />
);

/**
 * Skeleton rectangle
 */
export const SkeletonRect = ({ 
  width = '100%', 
  height = '100px', 
  className = '' 
}) => (
  <div 
    className={`skeleton-rect ${className}`}
    style={{ width, height }}
  />
);

/**
 * Skeleton circle
 */
export const SkeletonCircle = ({ 
  size = '40px', 
  className = '' 
}) => (
  <div 
    className={`skeleton-circle ${className}`}
    style={{ width: size, height: size }}
  />
);

/**
 * Recipe card skeleton
 */
export const RecipeCardSkeleton = () => (
  <div className="recipe-card-skeleton">
    <SkeletonRect height="200px" className="recipe-image-skeleton" />
    <div className="recipe-content-skeleton">
      <SkeletonText width="80%" height="1.5rem" className="recipe-title-skeleton" />
      <SkeletonText width="60%" height="1rem" className="recipe-meta-skeleton" />
      <SkeletonText width="100%" height="0.8rem" className="recipe-description-skeleton" />
      <SkeletonText width="100%" height="0.8rem" className="recipe-description-skeleton" />
      <div className="recipe-actions-skeleton">
        <SkeletonRect width="80px" height="32px" className="btn-skeleton" />
        <SkeletonRect width="80px" height="32px" className="btn-skeleton" />
      </div>
    </div>
  </div>
);

/**
 * Recipe list skeleton
 */
export const RecipeListSkeleton = ({ count = 6 }) => (
  <div className="recipe-list-skeleton">
    {Array.from({ length: count }, (_, index) => (
      <RecipeCardSkeleton key={index} />
    ))}
  </div>
);

/**
 * Recipe detail skeleton
 */
export const RecipeDetailSkeleton = () => (
  <div className="recipe-detail-skeleton">
    <div className="recipe-header-skeleton">
      <SkeletonRect height="300px" className="recipe-image-skeleton" />
      <div className="recipe-info-skeleton">
        <SkeletonText width="70%" height="2rem" className="recipe-title-skeleton" />
        <div className="recipe-meta-skeleton">
          <SkeletonText width="120px" height="1rem" />
          <SkeletonText width="120px" height="1rem" />
          <SkeletonText width="120px" height="1rem" />
        </div>
        <SkeletonText width="100%" height="1rem" className="recipe-description-skeleton" />
        <SkeletonText width="80%" height="1rem" className="recipe-description-skeleton" />
      </div>
    </div>
    
    <div className="recipe-sections-skeleton">
      <div className="ingredients-skeleton">
        <SkeletonText width="150px" height="1.5rem" className="section-title-skeleton" />
        <div className="ingredient-list-skeleton">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="ingredient-item-skeleton">
              <SkeletonText width="60%" height="1rem" />
              <SkeletonText width="30%" height="1rem" />
            </div>
          ))}
        </div>
      </div>
      
      <div className="steps-skeleton">
        <SkeletonText width="150px" height="1.5rem" className="section-title-skeleton" />
        <div className="step-list-skeleton">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="step-item-skeleton">
              <SkeletonText width="100%" height="1rem" />
              <SkeletonText width="80%" height="1rem" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Order card skeleton
 */
export const OrderCardSkeleton = () => (
  <div className="order-card-skeleton">
    <div className="order-header-skeleton">
      <SkeletonText width="120px" height="1rem" />
      <SkeletonText width="80px" height="1rem" />
    </div>
    <div className="order-items-skeleton">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="order-item-skeleton">
          <SkeletonText width="60%" height="0.8rem" />
          <SkeletonText width="20%" height="0.8rem" />
        </div>
      ))}
    </div>
    <div className="order-footer-skeleton">
      <SkeletonText width="100px" height="1rem" />
      <SkeletonRect width="80px" height="32px" className="btn-skeleton" />
    </div>
  </div>
);

/**
 * Order list skeleton
 */
export const OrderListSkeleton = ({ count = 5 }) => (
  <div className="order-list-skeleton">
    {Array.from({ length: count }, (_, index) => (
      <OrderCardSkeleton key={index} />
    ))}
  </div>
);

/**
 * Inventory item skeleton
 */
export const InventoryItemSkeleton = () => (
  <div className="inventory-item-skeleton">
    <div className="inventory-header-skeleton">
      <SkeletonText width="150px" height="1.2rem" />
      <SkeletonText width="80px" height="1rem" />
    </div>
    <div className="inventory-details-skeleton">
      <SkeletonText width="100px" height="0.8rem" />
      <SkeletonText width="80px" height="0.8rem" />
      <SkeletonText width="60px" height="0.8rem" />
    </div>
    <div className="inventory-actions-skeleton">
      <SkeletonRect width="60px" height="28px" className="btn-skeleton" />
      <SkeletonRect width="60px" height="28px" className="btn-skeleton" />
    </div>
  </div>
);

/**
 * Inventory list skeleton
 */
export const InventoryListSkeleton = ({ count = 8 }) => (
  <div className="inventory-list-skeleton">
    {Array.from({ length: count }, (_, index) => (
      <InventoryItemSkeleton key={index} />
    ))}
  </div>
);

/**
 * Table skeleton
 */
export const TableSkeleton = ({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}) => (
  <div className={`table-skeleton ${className}`}>
    <div className="table-header-skeleton">
      {Array.from({ length: columns }, (_, index) => (
        <SkeletonText key={index} width="120px" height="1.2rem" />
      ))}
    </div>
    <div className="table-body-skeleton">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="table-row-skeleton">
          {Array.from({ length: columns }, (_, colIndex) => (
            <SkeletonText key={colIndex} width="100px" height="1rem" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Form skeleton
 */
export const FormSkeleton = ({ fields = 5 }) => (
  <div className="form-skeleton">
    {Array.from({ length: fields }, (_, index) => (
      <div key={index} className="form-field-skeleton">
        <SkeletonText width="120px" height="1rem" className="field-label-skeleton" />
        <SkeletonRect height="40px" className="field-input-skeleton" />
      </div>
    ))}
    <div className="form-actions-skeleton">
      <SkeletonRect width="100px" height="40px" className="btn-skeleton" />
      <SkeletonRect width="80px" height="40px" className="btn-skeleton" />
    </div>
  </div>
);

/**
 * Chart skeleton
 */
export const ChartSkeleton = ({ height = '300px' }) => (
  <div className="chart-skeleton" style={{ height }}>
    <SkeletonRect width="100%" height="100%" className="chart-content-skeleton" />
  </div>
);

/**
 * Dashboard skeleton
 */
export const DashboardSkeleton = () => (
  <div className="dashboard-skeleton">
    <div className="dashboard-header-skeleton">
      <SkeletonText width="200px" height="2rem" />
      <SkeletonRect width="120px" height="40px" className="btn-skeleton" />
    </div>
    
    <div className="dashboard-stats-skeleton">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="stat-card-skeleton">
          <SkeletonText width="80px" height="1.5rem" />
          <SkeletonText width="120px" height="2rem" />
          <SkeletonText width="60px" height="1rem" />
        </div>
      ))}
    </div>
    
    <div className="dashboard-charts-skeleton">
      <div className="chart-section-skeleton">
        <SkeletonText width="150px" height="1.5rem" />
        <ChartSkeleton height="250px" />
      </div>
      <div className="chart-section-skeleton">
        <SkeletonText width="150px" height="1.5rem" />
        <ChartSkeleton height="250px" />
      </div>
    </div>
  </div>
);

/**
 * Page loading wrapper
 */
export const PageLoading = ({ 
  loading = false, 
  skeleton = null, 
  children, 
  message = 'Loading...' 
}) => {
  if (loading) {
    return skeleton || <LoadingOverlay message={message} />;
  }
  
  return children;
};

/**
 * Inline loading indicator
 */
export const InlineLoading = ({ 
  loading = false, 
  children, 
  loadingText = 'Loading...' 
}) => {
  if (loading) {
    return (
      <div className="inline-loading">
        <LoadingSpinner size={16} />
        <span>{loadingText}</span>
      </div>
    );
  }
  
  return children;
};

/**
 * Refresh button with loading state
 */
export const RefreshButton = ({ 
  loading = false, 
  onRefresh, 
  className = '' 
}) => (
  <button 
    className={`btn btn-secondary ${loading ? 'btn-loading' : ''} ${className}`}
    onClick={onRefresh}
    disabled={loading}
  >
    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
    <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
  </button>
);

export default {
  LoadingSpinner,
  LoadingOverlay,
  LoadingButton,
  SkeletonText,
  SkeletonRect,
  SkeletonCircle,
  RecipeCardSkeleton,
  RecipeListSkeleton,
  RecipeDetailSkeleton,
  OrderCardSkeleton,
  OrderListSkeleton,
  InventoryItemSkeleton,
  InventoryListSkeleton,
  TableSkeleton,
  FormSkeleton,
  ChartSkeleton,
  DashboardSkeleton,
  PageLoading,
  InlineLoading,
  RefreshButton
};
