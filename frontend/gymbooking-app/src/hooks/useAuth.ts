//gestiona el estado de si el usuario esta logeado o no
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useAuth(){
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        checkToken();
    }, []);

    async function checkToken(){
        const token = await AsyncStorage.getItem('token');
        setIsLoggedIn(!!token);
    }

    return {isLoggedIn, setIsLoggedIn, checkToken};
}