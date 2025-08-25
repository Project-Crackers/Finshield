import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { createTransaction } from '../features/transactions/transactionSlice';
import { FaPlus, FaSpinner, FaFileUpload, FaTrash } from 'react-icons/fa';
import transactionService from '../features/transactions/TransactionService';

const TransactionForm = ({ initialType = 'expense', onComplete }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    type: initialType
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billFile, setBillFile] = useState(null);
  const [billPreview, setBillPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Update type when initialType prop changes
  useEffect(() => {
    setFormData(prevState => ({
      ...prevState,
      type: initialType
    }));
  }, [initialType]);
  
  const { description, amount, category, type } = formData;
  const dispatch = useDispatch();
  
  const handleChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type - restrict to only images (PNG and JPEG)
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload only images (JPEG, PNG)');
      fileInputRef.current.value = '';
      return;
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should not exceed 5MB');
      fileInputRef.current.value = '';
      return;
    }
    
    setBillFile(file);
    
    // Create preview for images
    const reader = new FileReader();
    reader.onload = () => {
      setBillPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const removeBill = () => {
    setBillFile(null);
    setBillPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const uploadBill = async () => {
    if (!billFile) return null;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append(type === 'income' ? 'receiptImage' : 'billImage', billFile);
    
    try {
      // Use the appropriate upload endpoint based on transaction type
      const uploadEndpoint = type === 'income' ? 'uploadReceipt' : 'uploadBill';
      const uploadService = type === 'income' ? 
        (await import('../api/incomeService')).default.uploadReceipt :
        transactionService.uploadBill;
      
      const response = await uploadService(formData, config);
      setIsUploading(false);
      setUploadProgress(100);
      
      // Return the URL of the uploaded file
      return type === 'income' ? response.receiptUrl : response.billImageUrl;
    } catch (error) {
      console.error(`Error uploading ${type === 'income' ? 'receipt' : 'bill'}:`, error);
      setIsUploading(false);
      return null;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!description || !amount || !category) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload bill/receipt if provided
      let fileUrl = null;
      if (billFile) {
        fileUrl = await uploadBill();
      }
      
      const transactionData = {
        description,
        amount: parseFloat(amount),
        category,
        type
      };
      
      // Add billImageUrl or receiptUrl if file was uploaded
      if (fileUrl) {
        if (type === 'income') {
          transactionData.receiptUrl = fileUrl;
        } else {
          transactionData.billImageUrl = fileUrl;
        }
      }
      
      await dispatch(createTransaction(transactionData)).unwrap();
      
      // Reset form
      setFormData({
        description: '',
        amount: '',
        category: '',
        type: initialType
      });
      setBillFile(null);
      setBillPreview(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Call the onComplete callback if provided
      if (onComplete && typeof onComplete === 'function') {
        onComplete();
      }
    } catch (error) {
      console.error('Failed to create transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>            
      <div className="mb-4 form-control">
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <input
          type="text"
          name="description"
          value={description}
          onChange={handleChange}
          placeholder="What was this for?"
          className="w-full input input-bordered"
          required
        />
      </div>
      
      <div className="mb-4 form-control">
        <label className="label">
          <span className="label-text">Amount</span>
        </label>
        <input
          type="number"
          name="amount"
          value={amount}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          min="0"
          className="w-full input input-bordered"
          required
        />
      </div>
      
      <div className="mb-4 form-control">
        <label className="label">
          <span className="label-text">Category</span>
        </label>
        <select
          name="category"
          value={category}
          onChange={handleChange}
          className="w-full select select-bordered"
          required
        >
          <option value="" disabled>Select a category</option>
          <option value="Food">Food</option>
          <option value="Transportation">Transportation</option>
          <option value="Utilities">Utilities</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Salary">Salary</option>
          <option value="Investment">Investment</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      {/* File Upload Section */}
      <div className="mb-6 form-control">
        <label className="label">
          <span className="label-text">{type === 'income' ? 'Receipt Image' : 'Bill Image'} (Optional)</span>
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/jpg,application/pdf"
          onChange={handleFileChange}
          className="w-full file-input file-input-bordered"
          ref={fileInputRef}
        />
        <div className="mt-1 text-xs text-gray-500">
          Max size: 5MB. Allowed formats: JPEG, PNG
        </div>
        
        {/* Preview Section */}
        {billPreview && (
          <div className="relative mt-3">
            <div className="flex justify-between items-center p-2 rounded-md bg-base-200">
              <div className="flex-1">
                {billPreview === 'pdf' ? (
                  <div className="flex items-center text-primary">
                    <FaFileUpload className="mr-2" />
                    <span>PDF Document</span>
                  </div>
                ) : (
                  <div className="overflow-hidden relative w-full h-32 rounded-md">
                    <img 
                      src={billPreview} 
                      alt="Bill preview" 
                      className="object-contain w-full h-full"
                    />
                  </div>
                )}
              </div>
              <button 
                type="button" 
                onClick={removeBill}
                className="ml-2 btn btn-circle btn-sm btn-error"
              >
                <FaTrash />
              </button>
            </div>
            
            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="form-control">
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <FaPlus className="mr-2" />
              Add {type.charAt(0).toUpperCase() + type.slice(1)}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;