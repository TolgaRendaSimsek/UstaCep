export type JobStatus = 'waiting' | 'in_progress' | 'completed';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  business_name: string | null;
  trade_category: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Job {
  id: string;
  user_id: string;
  customer_id: string | null;
  title: string;
  description: string | null;
  status: JobStatus;
  payment_status: PaymentStatus;
  price: number;
  amount_paid: number;
  appointment_date: string | null;
  photo_urls: string[];
  created_at: string;
  customer?: Customer;
}

export interface Payment {
  id: string;
  user_id: string;
  job_id: string;
  amount: number;
  status: PaymentStatus;
  payment_date: string;
  created_at: string;
  updated_at?: string;
}

export interface PaymentSummary {
  totalPrice: number;
  totalPaid: number;
  remainingBalance: number;
  paymentState: PaymentStatus;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          business_name?: string | null;
          trade_category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          business_name?: string | null;
          trade_category?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: Customer;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone: string;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone?: string;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          user_id: string;
          customer_id: string | null;
          title: string;
          description: string | null;
          status: JobStatus;
          payment_status: PaymentStatus;
          price: number;
          amount_paid: number;
          appointment_date: string | null;
          photo_urls: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          customer_id?: string | null;
          title: string;
          description?: string | null;
          status?: JobStatus;
          payment_status?: PaymentStatus;
          price?: number;
          amount_paid?: number;
          appointment_date?: string | null;
          photo_urls?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          customer_id?: string | null;
          title?: string;
          description?: string | null;
          status?: JobStatus;
          payment_status?: PaymentStatus;
          price?: number;
          amount_paid?: number;
          appointment_date?: string | null;
          photo_urls?: string[];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "jobs_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      job_status: JobStatus;
      payment_status: PaymentStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
