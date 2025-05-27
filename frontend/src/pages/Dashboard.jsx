import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getTransactions } from '../features/transactions/transactionSlice';
import { FaWallet, FaChartLine, FaMoneyBillWave, FaSpinner } from 'react-icons/fa';
import { 
  BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  // All hooks must be called at the top level
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { transactions, stats, isLoading, blockchainStatus } = useSelector((state) => state.transactions);
  
  // Get user role, handling different user object structures
  const getUserRole = () => {
    if (!user) return null;
    return user.role || (user.user && user.user.role);
  };
  
  const userRole = getUserRole();
  
  // For monthly trends chart
  const [monthlyData, setMonthlyData] = useState([
    { name: '1/2023', income: 1500, expense: 1000 },
    { name: '2/2023', income: 2000, expense: 1200 },
    { name: '3/2023', income: 1800, expense: 1300 },
    { name: '4/2023', income: 2200, expense: 1100 },
    { name: '5/2023', income: 2500, expense: 1400 }
  ]);
  
  // For pie chart
  const [expenseCategories, setExpenseCategories] = useState([
    { name: 'Food', value: 400 },
    { name: 'Transportation', value: 300 },
    { name: 'Utilities', value: 200 },
    { name: 'Entertainment', value: 150 },
    { name: 'Healthcare', value: 100 }
  ]);
  
  // Add state for income categories
  const [incomeCategories, setIncomeCategories] = useState([
    { name: 'Salary', value: 2000 },
    { name: 'Freelance', value: 500 },
    { name: 'Investments', value: 300 },
    { name: 'Gifts', value: 150 }
  ]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];
  
  // Make sure useEffect has proper dependencies
  useEffect(() => {
    if (user && user.token) {
      dispatch(getTransactions());
    }
  },[dispatch]);
  
  // Process data when transactions change
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      // Process data for monthly trends
      const monthlyMap = {};
      
      // Use all transactions regardless of role
      transactions.forEach(transaction => {
        const date = new Date(transaction.createdAt);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        
        if (!monthlyMap[monthYear]) {
          monthlyMap[monthYear] = { 
            name: monthYear, 
            income: 0, 
            expense: 0 
          };
        }
        
        if (transaction.type === 'income') {
          monthlyMap[monthYear].income += transaction.amount;
        } else {
          monthlyMap[monthYear].expense += transaction.amount;
        }
      });
      
      // Convert to array and sort by date
      const monthlyArray = Object.values(monthlyMap);
      monthlyArray.sort((a, b) => {
        const [aMonth, aYear] = a.name.split('/');
        const [bMonth, bYear] = b.name.split('/');
        
        if (aYear !== bYear) return aYear - bYear;
        return aMonth - bMonth;
      });
      
      // Only update if we have data, otherwise keep the sample data
      if (monthlyArray.length > 0) {
        setMonthlyData(monthlyArray);
      }
      
      // Process data for expense categories
      const categoryMap = {};
      
      transactions
        .filter(transaction => transaction.type === 'expense')
        .forEach(transaction => {
          const category = transaction.category || 'Uncategorized';
          
          if (!categoryMap[category]) {
            categoryMap[category] = {
              name: category,
              value: 0
            };
          }
          
          categoryMap[category].value += transaction.amount;
        });
      
      const categoryArray = Object.values(categoryMap);
      // Only update if we have data, otherwise keep the sample data
      if (categoryArray.length > 0) {
        setExpenseCategories(categoryArray);
      }
      
      // Process data for income categories
      const incomeCategoryMap = {};
      
      transactions
        .filter(transaction => transaction.type === 'income')
        .forEach(transaction => {
          const category = transaction.category || 'Uncategorized';
          
          if (!incomeCategoryMap[category]) {
            incomeCategoryMap[category] = {
              name: category,
              value: 0
            };
          }
          
          incomeCategoryMap[category].value += transaction.amount;
        });
      
      const incomeCategoryArray = Object.values(incomeCategoryMap);
      // Only update if we have data, otherwise keep the sample data
      if (incomeCategoryArray.length > 0) {
        setIncomeCategories(incomeCategoryArray);
      }
    }
  }, [transactions]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>
      
      {/* Blockchain Status */}
      {blockchainStatus && (
        <div className="mb-6">
          <div className={`alert ${blockchainStatus.status === 'Secure' ? 'alert-success' : 'alert-error'}`}>
            <div className="flex-1">
              <label>Blockchain Status: {blockchainStatus.status}</label>
            </div>
          </div>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        <div className="shadow-xl card bg-base-200">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg card-title">Total Balance</h2>
                <p className="text-3xl font-bold">₹{stats?.balance?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="p-4 rounded-full bg-primary/20">
                <FaWallet className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="shadow-xl card bg-base-200">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg card-title">Total Income</h2>
                <p className="text-3xl font-bold text-success">₹{stats?.income?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="p-4 rounded-full bg-success/20">
                <FaChartLine className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="shadow-xl card bg-base-200">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg card-title">Total Expenses</h2>
                <p className="text-3xl font-bold text-error">₹{stats?.expenses?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="p-4 rounded-full bg-error/20">
                <FaMoneyBillWave className="w-6 h-6 text-error" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Section - Improved Layout */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Monthly Trends Chart */}
        <div className="shadow-xl card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Monthly Trends</h2>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#4ade80" />
                  <Bar dataKey="expense" name="Expense" fill="#f87171" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Pie Charts - Side by side */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Expense Categories Pie Chart */}
          <div className="shadow-xl card bg-base-200">
            <div className="card-body">
              <h2 className="card-title">Expense Breakdown</h2>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Income Categories Pie Chart */}
          <div className="shadow-xl card bg-base-200">
            <div className="card-body">
              <h2 className="card-title">Income Breakdown</h2>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#4ade80"
                      dataKey="value"
                    >
                      {incomeCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="shadow-xl card bg-base-200">
        <div className="card-body">
          <h2 className="card-title">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions && transactions.length > 0 ? (
                  transactions.slice(0, 5).map((transaction) => (
                    <tr key={transaction._id}>
                      <td>{transaction.description}</td>
                      <td>{transaction.category || 'Uncategorized'}</td>
                      <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                      <td className={transaction.type === 'income' ? 'text-success' : 'text-error'}>
                        {transaction.type === 'income' ? '+' : '-'}₹
                        {transaction.amount && !isNaN(transaction.amount)
                          ? parseFloat(transaction.amount).toFixed(2)
                          : '0.00'}
                      </td>
                      <td>
                        <span className={`badge ${
                          transaction.status === 'approved'
                            ? 'badge-success'
                            : transaction.status === 'pending'
                            ? 'badge-warning'
                            : 'badge-error'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">No transactions found</td>
                  </tr>
                )}
          </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
  