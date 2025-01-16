"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useRouter } from "next/navigation";

const DashboardPage = () => {
  const { logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [creatingTransaction, setCreatingTransaction] = useState(false); // Track the transaction creation state
  const [username, setUsername] = useState(null); // Store username from localStorage
  const router = useRouter();

  // Fetch user data from backend
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setUserData(response.data); // Set user data on successful fetch
      }

      // Redirect to admin dashboard if role is admin
      if (response.data.role === "admin") {
        router.push("/admin-dashboard");
      }
    } catch (err) {
      setError("Failed to fetch user data.");
    } finally {
      setLoading(false);
    }
  };

  // Use effect to safely access localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setUsername(storedUsername); // Set username for API calls
  }, [router]);

  useEffect(() => {
    if (username) {
      fetchUserData(); // Fetch user data when username is available
    }
  }, [username]);

  const handleLogout = () => {
    logout(); // Logout function
  };

  const handleCreateTransaction = async () => {
    if (!amount) {
      setError("Amount cannot be empty!");
      return;
    }

    setCreatingTransaction(true);
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/transactions/create`,
        {
          userId: userData.id,
          amount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        setUserData({
          ...userData,
          transactions: [...userData.transactions, response.data],
        });
        setAmount("");
        alert("Transaction created successfully!");
      }
    } catch (err) {
      setError("Failed to create transaction.");
    } finally {
      setCreatingTransaction(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 text-black">
      <div className="max-w-4xl w-full bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Welcome to Your Dashboard
        </h2>

        <div className="mt-6 space-y-4">
          <div>
            <p className="text-lg font-medium text-gray-700">
              Username: {userData?.username}
            </p>
            <p className="text-lg font-medium text-gray-700">
              Role: {userData?.role}
            </p>
            <p className="text-lg font-medium text-gray-700">
              Credit: {userData?.credit}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-bold text-gray-700">
              Create Transaction
            </h3>
            <div className="mt-4">
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md w-full"
              />
              <button
                onClick={handleCreateTransaction}
                disabled={creatingTransaction}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
              >
                {creatingTransaction ? "Creating..." : "Create Transaction"}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-bold text-gray-700">Transactions</h3>
            <div className="mt-4">
              {userData?.transactions?.length > 0 ? (
                userData.transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="mt-2 p-4 border rounded-lg"
                  >
                    <p className="text-lg font-medium text-gray-700">
                      Amount: {transaction.amount}
                    </p>
                    <p className="text-lg font-medium text-gray-700">
                      Status: {transaction.status}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No transactions available.</p>
              )}
            </div>
          </div>

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
    </div>
  );
};

export default DashboardPage;
