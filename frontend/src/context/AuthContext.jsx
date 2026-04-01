import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user"))
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {

            if (firebaseUser) {
                try {
                    const token = await firebaseUser.getIdToken();

                    const res = await fetch("http://localhost:8000/api/auth/sync", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                        }),
                    });

                    if (res.ok) {
                        const userFromBackend = await res.json();

                        const fullUser = {
                            ...userFromBackend,
                            firebaseEmailVerified: firebaseUser.emailVerified,
                        };

                        setUser(fullUser);
                        localStorage.setItem("user", JSON.stringify(fullUser));
                        localStorage.setItem("token", token);
                    } else {
                        setUser(null);
                    }

                } catch (e) {
                    console.error(e);
                    setUser(null);
                }
            } else {
                setUser(null);
                localStorage.removeItem("user");
                localStorage.removeItem("token");
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);