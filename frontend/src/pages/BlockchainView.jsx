import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getTransactions, getBlockchainStatus } from '../features/transactions/transactionSlice';
import { FaLink, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const BlockchainView = () => {
  const dispatch = useDispatch();
  const { transactions, blockchainStatus, isLoading } = useSelector((state) => state.transactions);
  
  useEffect(() => {
    dispatch(getTransactions());
    dispatch(getBlockchainStatus());
  }, [dispatch]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Blockchain View</h1>
        <p className="text-base-content/70">
          View the current state of the blockchain and transaction records
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center">
                <FaLink className="mr-2" />
                Blockchain Status
              </h2>
              <div className="mt-4">
                <div className="stats shadow w-full">
                  <div className="stat">
                    <div className="stat-title">Status</div>
                    <div className={`stat-value ${blockchainStatus?.status?.includes('Secure') ? 'text-success' : 'text-error'}`}>
                      {blockchainStatus?.status || 'Unknown'}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Transactions</div>
                    <div className="stat-value">{transactions?.length || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Blockchain Transactions</h2>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Created By</th>
                      <th>Timestamp</th>
                      <th>Hash</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions && transactions.length > 0 ? (
                      transactions.map((transaction) => {
                        // Find if this transaction has issues in the blockchain validation
                        const hasIssue = blockchainStatus?.issues?.some(
                          issue => issue.transactionId === transaction._id
                        );
                        
                        return (
                          <tr key={transaction._id}>
                            <td className="font-mono text-xs">{transaction._id}</td>
                            <td>{transaction.createdByName || transaction.createdBy}</td>
                            <td>{new Date(transaction.createdAt).toLocaleString()}</td>
                            <td className="font-mono text-xs truncate max-w-xs" title={transaction.hash}>
                              {transaction.hash}
                            </td>
                            <td>
                              {hasIssue ? (
                                <div className="badge badge-error gap-1">
                                  <FaExclamationTriangle /> Tampered
                                </div>
                              ) : (
                                <div className="badge badge-success gap-1">
                                  <FaCheck /> Secure
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">No transactions available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainView;