"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { API_BASE_URL } from "@/config/api";

export interface Website {
  _id: string;
  name: string;
  slug: string;
  url?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Company {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  siteUrl?: string;
  adminEmail: string;
  fromEmailName?: string;
  isActive: boolean;
  createdAt: string;
  websites?: Website[];
}

interface CompaniesContextValue {
  companies: Company[];
  loading: boolean;
  refetch: () => Promise<void>;
}

const CompaniesContext = createContext<CompaniesContextValue>({
  companies: [],
  loading: true,
  refetch: async () => {},
});



export function CompaniesProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

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
    <CompaniesContext.Provider value={{ companies, loading, refetch: fetchCompanies }}>
      {children}
    </CompaniesContext.Provider>
  );
}

export function useCompanies() {
  return useContext(CompaniesContext);
}
