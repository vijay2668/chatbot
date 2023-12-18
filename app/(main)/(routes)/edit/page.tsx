import { DashboardPage } from '@/components/dashboard';
import { ModalProvider } from '@/components/modal-provider';
import { currentProfile } from '@/lib/current-profile';

const MainDashboard = async () => {
  const profile: any = await currentProfile();

  return (
    <main className='h-full w-full'>
      <DashboardPage user={profile} />
      <ModalProvider user={profile} />
    </main>
  );
};

export default MainDashboard;
