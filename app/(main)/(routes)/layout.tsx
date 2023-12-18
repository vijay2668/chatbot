import { Sidebar } from "@/components/sidebar";


const MainLayout = async ({
  children
}: {
  children: React.ReactNode;
}) => {
  return ( 
    <div className="h-screen flex w-full">
      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <Sidebar />
      </div>
      <main className="md:pl-[72px] h-full w-full">
        {children}
      </main>
    </div>
   );
}
 
export default MainLayout;