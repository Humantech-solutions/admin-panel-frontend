"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/config/api";

export interface Website {
  _id: string;
  name: string;
  slug: string;
  url?: string;
  isActive: boolean;
  createdAt: string;
}

export interface SmtpConfig {
  host?: string;
  port?: number | string;
  user?: string;
  pass?: string;
  secure?: boolean;
}

export interface Company {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  siteUrl?: string;
  adminEmail: string;
  contactNotificationEmail?: string;
  careersNotificationEmail?: string;
  salesNotificationEmail?: string;
  fromEmailName?: string;
  isActive: boolean;
  createdAt: string;
  websites?: Website[];
  adminSmtp?: SmtpConfig;
  careersSmtp?: SmtpConfig;
  salesSmtp?: SmtpConfig;
  contactSmtp?: SmtpConfig;
}

interface CompaniesContextValue {
  companies: Company[];
  currentCompany?: Company;
  loading: boolean;
  refetch: () => Promise<void>;
}

const CompaniesContext = createContext<CompaniesContextValue>({
  companies: [],
  currentCompany: undefined,
  loading: true,
  refetch: async () => {},
});



export function CompaniesProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const portal = params?.portal as string;
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const currentCompany = companies.find(c => c.slug === portal || c._id === portal);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE_URL}/api/companies/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.companies)) {
        setCompanies(data.companies);
      }
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return (
    <CompaniesContext.Provider value={{ companies, currentCompany, loading, refetch: fetchCompanies }}>
      {children}
    </CompaniesContext.Provider>
  );
}

export function useCompanies() {
  return useContext(CompaniesContext);
}
