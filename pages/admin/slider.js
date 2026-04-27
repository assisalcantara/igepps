import AdminHeader from '@/components/AdminHeader';
import AdminSidebar from '@/components/AdminSidebar';
import AdminSlider from '@/components/AdminSlider';

export default function AdminSliderPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <AdminSlider />
        </main>
      </div>
    </div>
  );
}