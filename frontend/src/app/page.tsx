'use client';

import HomeClient from "@/components/Home/HomeClient";
import HomeInvitation from "@/components/Home/HomeInvitation";
import Loader from "@/components/Loader/Loader";
import { OpenAPI } from "@/openapi";
import { store } from "@/reducers/store";
import { JwtUtilities } from "@/utils/jwtUtilities";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";

export default function Home() {
  const router = useRouter();

  const [jwtExpired, setJwtExpired] = useState<boolean>(true);

  useEffect(() => {
    const jwtToken: string | null = localStorage.getItem('X-AUTH-TOKEN');
    const isExpired = JwtUtilities.isExpired(jwtToken);
    setJwtExpired(isExpired);
    if(!jwtToken || isExpired) {
      handleLogout();
    } else {
      OpenAPI.TOKEN = jwtToken;
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem('X-AUTH-TOKEN');
    router.push("/login")
  }

  return (
    <Provider store={store}>
      <Loader/>
      {jwtExpired == false && (
          process.env.APP_MODE === 'INVITATION' ?
          <HomeInvitation></HomeInvitation> : 
          <HomeClient></HomeClient>
        )
      }
    </Provider>
  );
}