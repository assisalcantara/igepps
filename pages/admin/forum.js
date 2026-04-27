import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AdminHeader from "@/components/AdminHeader";
import AdminSidebar from "@/components/AdminSidebar";
import Forum from "@/components/Forum";
import { safeGetItem } from '@/lib/storage';

export default function ForumAdminPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usu = safeGetItem("usuario");
    if (!usu) {
      router.push("/login");
      return;
    }

    const u = JSON.parse(usu);
    if (u.tipo !== "admin") {
      router.push("/dashboard");
      return;
    }

    setUsuario(u);
  }, []);

  if (!usuario) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader usuario={usuario} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <Forum usuario={usuario} />
        </main>
      </div>
    </div>
  );
}
