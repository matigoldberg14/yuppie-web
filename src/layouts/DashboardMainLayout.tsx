import { useSidebarStore } from '@/store/useSidebarStore';

export default function DashboardMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebarStore();

  return (
    <main className='w-full flex justify-end'>
      <div
        className={`transition-all duration-300 pt-32 px-8 ${
          isCollapsed ? 'w-[calc(100%-4rem)]' : 'w-[calc(100%-16rem)]'
        }`}
      >
        {children}
      </div>
    </main>
  );
}
