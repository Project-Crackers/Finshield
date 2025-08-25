import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getTransactions,
  createTransaction,
  reset,
} from "../features/transactions/transactionSlice";
import { getComments, addComment } from "../features/comments/commentSlice";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaComment,
  FaRupeeSign,
  FaTag,
  FaPaperclip,
  FaFileCsv,
  FaFilePdf,
} from "react-icons/fa";
import transactionService from "../features/transactions/TransactionService";
import { FaEye } from "react-icons/fa";

const Expense = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { transactions, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.transactions
  );

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    type: "expense",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [viewImageModal, setViewImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const { comments, isLoading: commentsLoading } = useSelector(
    (state) => state.comments
  );

  useEffect(() => {
    dispatch(getTransactions());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess && message) {
      toast.success(message);
    }
  }, [isSuccess, isError, message]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPEG, PNG, GIF) or PDF file');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description || !formData.amount || !formData.category) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!selectedFile) {
      toast.error("Please upload a bill or receipt");
      return;
    }

    try {
      // Create form data for file upload
      const fileFormData = new FormData();
      fileFormData.append('bill', selectedFile);
      
      // Upload the file using transactionService
      const uploadResponse = await transactionService.uploadBill(fileFormData);
  
      // Create the transaction with the returned file URL
      const expenseData = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        type: 'expense',
        billImageUrl: uploadResponse.url // Make sure to use the correct property from the response
      };
  
      await dispatch(createTransaction(expenseData)).unwrap();
      
      // Reset form
      setFormData({
        description: "",
        amount: "",
        category: "",
        type: "expense",
      });
      setSelectedFile(null);
      setUploadProgress(0);
      setShowForm(false);
      
      toast.success("Expense created successfully");
      dispatch(getTransactions()); // Refresh the list after successful creation
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.error(error.response?.data?.message || "Failed to create expense");
    }
  };

  // Filter only expenses
  const expenses = Array.isArray(transactions)
    ? transactions.filter((transaction) => transaction.type === "expense")
    : [];

  // Handle comment submission
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    dispatch(
      addComment({
        transactionId: selectedExpense._id,
        content: commentText,
      })
    )
      .unwrap()
      .then(() => {
        // After successful comment submission, refresh comments
        dispatch(getComments(selectedExpense._id));
        setCommentText("");
      })
      .catch((error) => {
        console.error("Error adding comment:", error);
      });
  };

  // Load comments when an expense is selected
  const handleViewComments = (expense) => {
    setSelectedExpense(expense);
    setShowComments(true);
    dispatch(getComments(expense._id));
  };

  // Handle expense approval
  const handleApproveExpense = async (expense) => {
    try {
      await transactionService.updateTransactionStatus(expense._id, "approved");
      toast.success("Expense approved successfully");
      // Refresh the transactions list
      dispatch(getTransactions());
    } catch (error) {
      toast.error("Failed to approve expense");
    }
  };

  // Handle expense rejection
  const handleRejectExpense = async (expense) => {
    try {
      await transactionService.updateTransactionStatus(expense._id, "rejected");
      toast.success("Expense rejected successfully");
      // Refresh the transactions list
      dispatch(getTransactions());
    } catch (error) {
      toast.error("Failed to reject expense");
    }
  };

  // Check if user can approve/reject (Admin or Manager, but not self-approval)
  const canApprove = (expense) => {
    if (!user) return false;

    // Get user role, handling different user object structures
    const userRole = user.role || (user.user && user.user.role);
    const userId = user.id || user._id || (user.user && user.user._id);

    // Admin can approve any expense
    if (userRole === "Admin") return true;

    // Manager can approve expenses not created by themselves
    if (userRole === "Manager") {
      // Check if the expense user ID matches the current user ID
      // The expense.user might be either the full ID or just the ID string
      const expenseUserId =
        typeof expense.user === "object" ? expense.user._id : expense.user;
      return expenseUserId !== userId;
    }

    return false;
  };

  const [isExporting, setIsExporting] = useState(false);

  // Handle CSV export
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      await transactionService.exportExpensesAsCSV();
      toast.success("Expenses exported as CSV successfully");
    } catch (error) {
      toast.error("Failed to export expenses as CSV");
      console.error("CSV export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle PDF export
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await transactionService.exportExpensesAsPDF();
      toast.success("Expenses exported as PDF successfully");
    } catch (error) {
      toast.error("Failed to export expenses as PDF");
      console.error("PDF export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleExportCSV}
            className="btn btn-outline btn-primary"
            disabled={isExporting || isLoading}
          >
            {isExporting ? (
              <FaSpinner className="mr-2 animate-spin" />
            ) : (
              <FaFileCsv className="mr-2" />
            )}
            Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="btn btn-outline btn-success"
            disabled={isExporting || isLoading}
          >
            {isExporting ? (
              <FaSpinner className="mr-2 animate-spin" />
            ) : (
              <FaFilePdf className="mr-2" />
            )}
            Export PDF
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? <FaTimes /> : <FaPlus />}
            {showForm ? "Cancel" : "Add Expense"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
          <div className="p-6 w-full max-w-md rounded-lg shadow-xl bg-base-100">
            <h2 className="mb-4 text-xl font-bold">Add New Expense</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4 form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input input-bordered"
                  placeholder="What was this expense for?"
                />
              </div>

              <div className="mb-4 form-control">
                <label className="label">
                  <span className="label-text">Amount</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    <FaRupeeSign />
                  </span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="pl-10 w-full input input-bordered"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="mb-4 form-control">
                <label className="label">
                  <span className="label-text">Category</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    <FaTag />
                  </span>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="pl-10 w-full select select-bordered"
                  >
                    <option value="" disabled>Select a category</option>
                    <option value="Food">Food</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="mb-4 form-control">
                <label className="label">
                  <span className="label-text">Upload Bill/Receipt</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.gif,.pdf"
                    className="hidden"
                    id="billUpload"
                  />
                  <label
                    htmlFor="billUpload"
                    className="flex gap-2 items-center px-4 py-2 w-full text-center rounded-lg border transition-colors cursor-pointer border-base-300 hover:bg-base-200"
                  >
                    <FaPaperclip />
                    {selectedFile ? selectedFile.name : "Click to upload bill/receipt"}
                  </label>
                </div>
                {selectedFile && (
                  <div className="mt-2 text-sm text-base-content/70">
                    Selected file: {selectedFile.name}
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isLoading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    "Submit Expense"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expenses List */}
      {isLoading && expenses.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="py-12 text-center rounded-lg bg-base-200">
          <h3 className="mb-2 text-xl font-semibold">No expenses found</h3>
          <p className="text-base-content/70">
            Add your first expense to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {expenses.map((expense) => (
            <div key={expense._id} className="shadow-md card bg-base-100">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <h3 className="card-title">{expense.description}</h3>
                  <span
                    className={`badge ${
                      expense.status === "approved"
                        ? "badge-success"
                        : expense.status === "rejected"
                        ? "badge-error"
                        : "badge-warning"
                    }`}
                  >
                    {expense.status}
                  </span>
                </div>

                <div className="mt-2">
                  <p className="text-2xl font-bold">
                    ₹{parseFloat(expense.amount).toFixed(2)}
                  </p>
                  <p className="text-sm opacity-70">
                    Category: {expense.category}
                  </p>
                  <p className="text-sm opacity-70">
                    {new Date(expense.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="justify-end mt-4 card-actions">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleViewComments(expense)}
                  >
                    <FaComment className="mr-1" /> Comments
                  </button>

                  {expense.billImageUrl && (
                    <button
                      onClick={() => handleViewImage(expense.billImageUrl)}
                      className="btn btn-sm btn-outline btn-secondary"
                    >
                      {expense.billImageUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <>
                          <FaEye className="mr-1" /> View Image
                        </>
                      ) : (
                        <>
                          <FaFilePdf className="mr-1" /> View Doc
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Add approval/rejection buttons for admin and manager */}
                {expense.status === "pending" && canApprove(expense) && (
                  <div className="flex justify-between pt-4 mt-4 border-t border-base-300">
                    <button
                      onClick={() => handleApproveExpense(expense)}
                      className="btn btn-sm btn-success"
                    >
                      <FaCheck className="mr-1" /> Approve
                    </button>
                    <button
                      onClick={() => handleRejectExpense(expense)}
                      className="btn btn-sm btn-error"
                    >
                      <FaTimes className="mr-1" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {viewImageModal && currentImage && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
          <div className="relative p-2 max-w-4xl bg-white rounded-lg">
            <button
              onClick={() => setViewImageModal(false)}
              className="absolute top-2 right-2 btn btn-sm btn-circle"
            >
              ✖
            </button>
            <img
              src={currentImage}
              alt="Bill Preview"
              className="max-h-[80vh] rounded-lg"
            />
          </div>
        </div>
      )}
      {/* End Image Viewer Modal */}

      {/* Comments Modal */}
      {/* Inside the comments modal section*/}
      {showComments && selectedExpense && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
          <div className="p-6 w-full max-w-md rounded-lg shadow-xl bg-base-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                Comments for {selectedExpense.description}
              </h3>
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

export default Expense;
