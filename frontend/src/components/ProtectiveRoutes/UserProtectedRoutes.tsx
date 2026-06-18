import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthCheckSkeleton from "../prompts/auth-check-skeleton";
import { Navbar } from "../navbar/navbar";
import { getAuthToken } from "@/lib/utils";

const UserProtectedRoutes = () => {
    const [email, setEmail] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        let isMounted = true;
        console.log(isMounted);

        const checkToken = async () => {
            const { token, payload } = await getAuthToken();
            if (payload) {
                console.log(token);
                setEmail(payload?.email ?? "");
                setUsername(payload?.name ?? "");
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        };

        checkToken();
        return () => { isMounted = false; };
    }, []);

    if (isAuthenticated === null) {
        return <AuthCheckSkeleton />;
    }

    return isAuthenticated ? (
        <>
            <div>
                <Navbar
                    username={username}
                    email={email}
                />

                <Outlet />
            </div>
        </>
    ) : <Navigate to="/login" />;
};

export default UserProtectedRoutes;