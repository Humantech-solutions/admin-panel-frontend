import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "Admin – SahajCRM",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
