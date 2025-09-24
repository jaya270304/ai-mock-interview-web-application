import { Conatiner } from "@/components/conatiner";
import { Footer } from "@/components/footer";
import Header from "@/components/header";

import { Outlet } from "react-router-dom";


export const MainLayout = () =>{
    return (
        <div className="flex flex-col h-screen"> 
        
        <Header />
        <Conatiner className="flex-grow">
            <main className="flex-grow">
               <Outlet />
            </main>
        </Conatiner>
        
        
        
        <Footer />
        </div>
    );
};