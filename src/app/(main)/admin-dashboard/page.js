"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useRouter } from "next/navigation";

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Fetch user data and validate if admin
  const fetchUserData = async () => {
    try {
      const user = localStorage.getItem("username");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${user}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        setUserData(response.data);
        if (response.data.role !== "admin") {
          router.push("/dashboard"); // Redirect if not admin
        }
      }
    } catch (err) {
      setError("Failed to fetch user data.");
    }
  };

  // Fetch all transactions
  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/transactions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        setTransactions(response.data);
      }
    } catch (err) {
      setError("Failed to fetch transactions.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch the necessary data on component mount
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    } else {
      fetchUserData();
    }
  }, [router]);

  useEffect(() => {
    if (userData?.role === "admin") {
      fetchTransactions();
    }
  }, [userData]);

  // Approve a transaction
  const approveTransaction = async (transactionId) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/transactions/approve/${transactionId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        const updatedTransactions = transactions.map((transaction) => {
          if (transaction.id === transactionId) {
            transaction.status = "approved";
          }
          return transaction;
        });
        setTransactions(updatedTransactions);
      }
    } catch (err) {
      setError("Failed to approve transaction.");
    }
  };

  // Reject a transaction
  const rejectTransaction = async (transactionId) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/transactions/reject/${transactionId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        const updatedTransactions = transactions.map((transaction) => {
          if (transaction.id === transactionId) {
            transaction.status = "rejected";
          }
          return transaction;
        });
        setTransactions(updatedTransactions);
      }
    } catch (err) {
      setError("Failed to reject transaction.");
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Admin Dashboard
        </h2>

        {/* User Info */}
        <div className="mt-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-700">User Info</h3>
          <p className="text-lg font-medium text-gray-700">
            Username: {userData?.username}
          </p>
          <p className="text-lg font-medium text-gray-700">
            Role: {userData?.role}
          </p>
        </div>

        {/* Transactions List */}
        <div className="mt-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-700">Pending Transactions</h3>
          <div className="mt-4">
            {transactions.filter((transaction) => transaction.status === "pending").length > 0 ? (
              transactions
                .filter((transaction) => transaction.status === "pending")
                .map((transaction) => (
                  <div
                    key={transaction.id}
                    className="mt-4 p-4 border rounded-lg"
                  >
                    <h4 className="text-lg font-medium text-gray-700">
                      Transaction ID: {transaction.id}
                    </h4>
                    <p className="text-gray-500">Amount: {transaction.amount}</p>
                    <p className="text-lg text-yellow-500">
                      Status: {transaction.status}
                    </p>

                    {/* Approve/Reject Buttons */}
                    <div className="mt-4 flex space-x-4">
                      <button
                        onClick={() => approveTransaction(transaction.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectTransaction(transaction.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-gray-500">No pending transactions available.</p>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
