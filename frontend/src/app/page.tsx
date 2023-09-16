'use client';

import HomeClient from "@/components/Home/HomeClient";
import HomeInvitation from "@/components/Home/HomeInvitation";
import { OpenAPI } from "@/openapi";
import { JwtUtilities } from "@/utils/jwtUtilities";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
    <>
      {jwtExpired == false && (
          process.env.APP_MODE === 'INVITATION' ?
          <HomeInvitation></HomeInvitation> : 
          <HomeClient></HomeClient>
        )
      }
    </>
  );
}