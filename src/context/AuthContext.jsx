
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

const USER_STORAGE_KEY = "mailoraUser";
const LEGACY_USER_KEY = "nexoraUser";

function readStoredUser() {
  try {
    const stored =
      localStorage.getItem(USER_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_USER_KEY);

    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function getErrorMessage(error, fallback) {
  if (typeof error === "string") return error;
  return error?.message || fallback;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Unable to save Mailora session:", error);
    }
  }, [user]);

  const login = useCallback(async (email, password) => {
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail || !password) {
      throw new Error("Email and password are required.");
    }

    setLoading(true);

    try {
      const accounts = JSON.parse(
        localStorage.getItem("mailoraAccounts") || "[]"
      );

      const account = accounts.find(
        (item) =>
          item.email?.toLowerCase() === cleanEmail &&
          item.password === password
      );

      if (!account) {
        throw new Error(
          "Invalid email or password. Please check your details or create an account."
        );
      }

      const authenticatedUser = {
        id: account.id,
        name: account.name,
        email: account.email,
      };

      setUser(authenticatedUser);

      return {
        success: true,
        user: authenticatedUser,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (details) => {
    const name = String(details?.name || "").trim();
    const email = String(details?.email || "").trim().toLowerCase();
    const password = String(details?.password || "");

    if (!name || !email || !password) {
      throw new Error("Please complete all required fields.");
    }

    setLoading(true);

    try {
      const accounts = JSON.parse(
        localStorage.getItem("mailoraAccounts") || "[]"
      );

      const existingAccount = accounts.some(
        (account) => account.email?.toLowerCase() === email
      );

      if (existingAccount) {
        throw new Error(
          "An account with this email already exists. Please sign in."
        );
      }

      const newAccount = {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `user-${Date.now()}`,
        name,
        email,
        password,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "mailoraAccounts",
        JSON.stringify([...accounts, newAccount])
      );

      const authenticatedUser = {
        id: newAccount.id,
        name: newAccount.name,
        email: newAccount.email,
      };

      setUser(authenticatedUser);

      return {
        success: true,
        user: authenticatedUser,
      };
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Unable to create your account.")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const register = signup;

  const resetPassword = useCallback(async (email) => {
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail) {
      throw new Error("Please enter your email address.");
    }

    /*
     * This demo stores accounts locally in the browser.
     * A real reset link requires a backend or authentication provider.
     */
    const accounts = JSON.parse(
      localStorage.getItem("mailoraAccounts") || "[]"
    );

    const accountExists = accounts.some(
      (account) => account.email?.toLowerCase() === cleanEmail
    );

    if (!accountExists) {
      throw new Error(
        "No local account was found for this email address."
      );
    }

    throw new Error(
      "Your account exists, but email-based password recovery is not configured. Connect a backend or authentication provider to send a secure reset link."
    );
  }, []);

  const forgotPassword = resetPassword;

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      register,
      resetPassword,
      forgotPassword,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [
      user,
      loading,
      login,
      signup,
      register,
      resetPassword,
      forgotPassword,
      logout,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
}
