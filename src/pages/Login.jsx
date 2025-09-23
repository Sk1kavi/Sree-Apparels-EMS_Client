import { useState } from "react";

export default function Login({ onLogin }) {
  const [role, setRole] = useState("staff");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (role === "staff") {
        res = await fetch("https://sree-apparels-ems.onrender.com/api/auth/staff/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        });
      } else {
        res = await fetch("https://sree-apparels-ems.onrender.com/api/auth/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      if (role === "staff") {
        onLogin("staff", data.staff || data);
      } else {
        onLogin("admin", data.admin || data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-200">
      <div className="w-full max-w-md bg-white/90 shadow-2xl rounded-2xl p-8 border border-indigo-100">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-indigo-600 rounded-full p-3 mb-2 shadow-lg">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path
                fill="#fff"
                d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.418 0-8 2.239-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.761-3.582-5-8-5Z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-indigo-700 mb-1">Welcome Back</h2>
          <p className="text-gray-500 text-sm">Sign in to your account</p>
        </div>

        <div className="flex justify-center mb-6">
          <button
            type="button"
            className={`px-4 py-2 rounded-l-lg font-semibold transition-colors duration-200 ${
              role === "staff" ? "bg-indigo-600 text-white" : "bg-gray-100 text-indigo-600 hover:bg-indigo-50"
            }`}
            onClick={() => setRole("staff")}
          >
            Staff
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-r-lg font-semibold transition-colors duration-200 ${
              role === "admin" ? "bg-indigo-600 text-white" : "bg-gray-100 text-indigo-600 hover:bg-indigo-50"
            }`}
            onClick={() => setRole("admin")}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {role === "staff" ? (
            <div>
              <label className="block text-gray-700 font-medium mb-1">Mobile Number</label>
              <input
                type="text"
                placeholder="Enter Mobile Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-indigo-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                required
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-indigo-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-indigo-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  required
                />
              </div>
            </>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 text-white py-3 rounded-lg font-semibold shadow-md"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
