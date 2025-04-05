
import React from "react";
import { useSearchParams } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Auth = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isRegister = searchParams.get("register") === "true";
  
  const handleTabChange = (value: string) => {
    if (value === "register") {
      setSearchParams({ register: "true" });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">
            <span className="text-jobspark-primary">Job</span>
            <span className="text-jobspark-accent">Spark</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            AI-powered job matching platform
          </p>
        </div>
        
        <Tabs 
          defaultValue={isRegister ? "register" : "login"}
          className="w-full" 
          onValueChange={handleTabChange}
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
