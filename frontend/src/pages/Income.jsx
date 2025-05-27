import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getTransactions, updateTransaction } from '../features/transactions/transactionSlice';
import { getComments, addComment } from '../features/comments/commentSlice';
import { toast } from 'react-toastify';
import { FaPlus, FaCheck, FaTimes, FaEye, FaSpinner, FaMoneyBillWave, FaCalendarAlt, FaTag, FaUser, FaComments, FaFilePdf } from 'react-icons/fa';
import TransactionForm from '../components/TransactionForm';
import transactionService from '../features/transactions/TransactionService';

const Income = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { transactions, isLoading } = useSelector((state) => state.transactions);
  const { comments, isLoading: commentsLoading } = useSelector((state) => state.comments);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentIncome, setCurrentIncome] = useState(null);
  const [incomeTransactions, setIncomeTransactions] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [stats, setStats] = useState({
    totalIncome: 0,
    pendingIncome: 0,
    approvedIncome: 0
  });

  // Determine user role
  const getUserRole = () => {
    if (!user) return null;
    return user.role || (user.user && user.user.role);
  };

  const userRole = getUserRole();
  const isAdmin = userRole === 'Admin';
  const isManager = userRole === 'Manager';
  const isAdminOrManager = isAdmin || isManager;

  // Filter income transactions and calculate stats
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      // Filter only income transactions
      const incomeOnly = transactions.filter(transaction => transaction.type === 'income');
      setIncomeTransactions(incomeOnly);
      
      // Calculate stats
      const total = incomeOnly.reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);
      const pending = incomeOnly
        .filter(income => income.status === 'Pending' || income.status === 'pending')
        .reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);
      const approved = incomeOnly
        .filter(income => income.status === 'Approved' || income.status === 'approved')
        .reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);
      
      setStats({
        totalIncome: total,
        pendingIncome: pending,
        approvedIncome: approved
      });
    }
  }, [transactions]);

  // Fetch transactions
  useEffect(() => {
    if (user && user.token) {
      dispatch(getTransactions());
    }
  }, [user, dispatch]);

  // Handle income approval
  const handleApproveIncome = async (income) => {
    try {
      await transactionService.updateTransactionStatus(income._id, 'approved');
      toast.success('Income approved successfully');
      // Refresh the transactions list
      dispatch(getTransactions());
    } catch (error) {
      toast.error('Failed to approve income');
      console.error(error);
    }
  };

  // Handle income rejection
  const handleRejectIncome = async (income) => {
    try {
      await transactionService.updateTransactionStatus(income._id, 'rejected');
      toast.success('Income rejected successfully');
      // Refresh the transactions list
      dispatch(getTransactions());
    } catch (error) {
      toast.error('Failed to reject income');
      console.error(error);
    }
  };

  // View income details
  const handleViewIncome = (income) => {
    setCurrentIncome(income);
    setShowViewModal(true);
  };

  // Check if user can approve/reject (Admin or Manager, but not self-approval)
  const canApprove = (income) => {
    if (!user) return false;
    
    // Get user role and ID properly, handling different user object structures
    const userRole = user.role || (user.user && user.user.role);
    const userId = user.id || user._id || (user.user && user.user._id);
    
    // For debugging
    console.log('User Role:', userRole);
    console.log('User ID:', userId);
    console.log('Income User:', income.user);
    console.log('Income Status:', income.status);
    
    // Check for both uppercase and lowercase status values
    const isPending = income.status === 'Pending' || income.status === 'pending';
    
    // Admin can approve any income
    if (userRole === 'Admin') return isPending;
    
    // Manager can approve incomes not created by themselves
    if (userRole === 'Manager' && income.user !== userId) return isPending;
    
    return false;
  };

  // Get status badge class based on status
  const getStatusBadgeClass = (status) => {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower === 'approved') {
      return 'badge-success';
    } else if (statusLower === 'rejected') {
      return 'badge-error';
    } else {
      return 'badge-warning'; // For pending or any other status
    }
  };

  // Handle form submission completion
  const handleFormSubmit = () => {
    setShowAddModal(false);
    // Refresh transactions after adding new income
    dispatch(getTransactions());
  };

  // Handle comment submission
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    
    dispatch(addComment({
      transactionId: currentIncome._id,
      content: commentText
    }))
    .unwrap()
    .then(() => {
      // After successful comment submission, refresh comments
      dispatch(getComments(currentIncome._id));
      setCommentText('');
    })
    .catch((error) => {
      console.error('Error adding comment:', error);
    });
  };
  
  // Load comments when an income is selected
  const handleViewComments = (income) => {
    setCurrentIncome(income);
    setShowComments(true);
    dispatch(getComments(income._id));
  };

  return (
    <div className="container p-4 mx-auto">
      {/* Income Stats Cards - Dashboard Integration */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        <div className="shadow-xl card bg-base-200">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg card-title">Total Income</h2>
                <p className="text-3xl font-bold text-success">₹{stats.totalIncome.toFixed(2)}</p>
              </div>
              <div className="p-4 rounded-full bg-success/20">
                <FaMoneyBillWave className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="shadow-xl card bg-base-200">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg card-title">Pending Income</h2>
                <p className="text-3xl font-bold text-warning">₹{stats.pendingIncome.toFixed(2)}</p>
              </div>
              <div className="p-4 rounded-full bg-warning/20">
                <FaCalendarAlt className="w-6 h-6 text-warning" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="shadow-xl card bg-base-200">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg card-title">Approved Income</h2>
                <p className="text-3xl font-bold text-primary">₹{stats.approvedIncome.toFixed(2)}</p>
              </div>
              <div className="p-4 rounded-full bg-primary/20">
                <FaCheck className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Income Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          <FaPlus className="mr-2" /> Add Income
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {incomeTransactions.length > 0 ? (
            incomeTransactions.map((income) => (
              <div key={income._id} className="shadow-lg card bg-base-200">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <h2 className="card-title">{income.description || income.title}</h2>
                    <span className={`badge ${getStatusBadgeClass(income.status)}`}>
                      {income.status}
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-2xl font-bold">₹{parseFloat(income.amount).toFixed(2)}</p>
                    <p className="flex items-center mt-1 text-sm text-base-content/70">
                      <FaTag className="mr-1" /> {income.category}
                    </p>
                    <p className="flex items-center mt-1 text-sm text-base-content/70">
                      <FaCalendarAlt className="mr-1" /> {new Date(income.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="justify-end mt-4 card-actions">
                    <button
                      onClick={() => handleViewComments(income)}
                      className="btn btn-sm btn-outline"
                    >
                      <FaComments className="mr-1" /> Comments
                    </button>
                    
                    <button
                      onClick={() => handleViewIncome(income)}
                      className="btn btn-sm btn-outline btn-primary"
                    >
                      <FaEye className="mr-1" /> View
                    </button>
                    
                    {income.receiptUrl && (
                      <a 
                        href={income.receiptUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline btn-secondary"
                      >
                        <FaFilePdf className="mr-1" /> View Doc
                      </a>
                    )}
                    
                    {/* Simplified condition for approve/reject buttons */}
                    {(income.status === 'Pending' || income.status === 'pending') && isAdminOrManager && (
                      <div className="flex gap-2 mt-2 w-full">
                        <button
                          onClick={() => handleApproveIncome(income)}
                          className="flex-1 btn btn-sm btn-success"
                        >
                          <FaCheck className="mr-1" /> Approve
                        </button>
                        
                        <button
                          onClick={() => handleRejectIncome(income)}
                          className="flex-1 btn btn-sm btn-error"
                        >
                          <FaTimes className="mr-1" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 p-8 text-center">
              <p className="mb-4 text-lg">No income transactions found</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
              >
                <FaPlus className="mr-2" /> Add Your First Income
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Income Modal */}
      {showAddModal && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
          <div className="p-6 w-full max-w-md rounded-lg shadow-xl bg-base-100">
            <h2 className="mb-4 text-xl font-bold">Add New Income</h2>
            <TransactionForm onComplete={handleFormSubmit} initialType="income" />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Income Modal */}
      {showViewModal && currentIncome && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
          <div className="p-6 w-full max-w-lg rounded-lg shadow-xl bg-base-100">
            <h2 className="mb-4 text-xl font-bold">{currentIncome.description || currentIncome.title}</h2>
            
            <div className="mb-4">
              <div className="mb-2 shadow stats">
                <div className="stat">
                  <div className="stat-title">Amount</div>
                  <div className="stat-value text-success">₹{parseFloat(currentIncome.amount).toFixed(2)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold">Category</p>
                  <p>{currentIncome.category}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Status</p>
                  <p><span className={`badge ${getStatusBadgeClass(currentIncome.status)}`}>{currentIncome.status}</span></p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Created On</p>
                  <p>{new Date(currentIncome.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Created By</p>
                  <p className="flex gap-1 items-center">
                    {currentIncome.userName || currentIncome.user?.name || 'User'}
                    {(currentIncome.userRole || currentIncome.user?.role) && (
                      <span className="badge badge-sm badge-outline">
                        {currentIncome.userRole || currentIncome.user?.role}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              {currentIncome.receiptUrl && (
                <div className="mt-4">
                  <p className="text-sm font-semibold">Document</p>
                  <a 
                    href={currentIncome.receiptUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-1 btn btn-sm btn-outline btn-secondary"
                  >
                    <FaFilePdf className="mr-1" /> View Doc
                  </a>
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="btn btn-outline"
              >
                Close
              </button>
              
              {currentIncome.status === 'Pending' && canApprove(currentIncome) && (
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      handleApproveIncome(currentIncome);
                      setShowViewModal(false);
                    }}
                    className="btn btn-success"
                  >
                    <FaCheck className="mr-1" /> Approve
                  </button>
                  
                  <button
                    onClick={() => {
                      handleRejectIncome(currentIncome);
                      setShowViewModal(false);
                    }}
                    className="btn btn-error"
                  >
                    <FaTimes className="mr-1" /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showComments && currentIncome && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
          <div className="p-6 w-full max-w-lg rounded-lg shadow-xl bg-base-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="mb-4 text-xl font-bold">Comments for {currentIncome.title || currentIncome.description}</h2>

            <button
                onClick={() => setShowComments(false)}
                className="btn btn-sm btn-circle"
              >
                ✖
              </button>
              </div>
            
            
              <div className="overflow-y-auto mb-4 max-h-60">
              {commentsLoading ? (
                <div className="flex justify-center py-4">
                  <FaSpinner className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="p-3 mb-3 rounded-lg bg-base-200"
                  >
                    <div className="flex justify-between">
                      <div className="font-semibold">{comment.user?.name}</div>
                      <div className="badge badge-primary">
                        {comment.user?.role || "User"}
                      </div>
                    </div>
                    <div className="text-xs text-base-content/70">
                      {new Date(comment.createdAt).toLocaleString()}
                    </div>
                    <p className="mt-1">{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-base-content/70">
                  No comments yet
                </p>
              )}
            </div>

            <form onSubmit={handleCommentSubmit}>
              <div className="form-control">
                <textarea
                  className="w-full textarea textarea-bordered"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows="3"
                ></textarea>
              </div>
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!commentText.trim()}
                >
                  Post Comment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Income;
