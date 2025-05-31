import RestaurantValidator from '@/components/dashboard/RestaurantValidator';
import { useSidebarStore } from '@/store/useSidebarStore';

export default function DashboardMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebarStore();

  return (
    <main className='w-full max-w-dvw overflow-x-hidden flex justify-end'>
      <RestaurantValidator />
      <div
        className={`transition-all duration-300 pt-24 pb-28 md:pt-32 md:pb-4 px-4 md:px-8 w-full ${
          isCollapsed ? 'md:w-[calc(100%-4rem)]' : 'md:w-[calc(100%-16rem)]'
        }`}
      >
        {children}
      </div>
    </main>
  );
}
