'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Payment {
  id: number
  description: string
  amount: number
  date: string
  status: 'paid' | 'pending'
  method?: string
}

export default function FeesPage() {
  const router = useRouter()
  const [payments] = useState<Payment[]>([
    {
      id: 1,
      description: 'Tuition Fee - Semester 1',
      amount: 5000,
      date: '2024-01-15',
      status: 'paid',
      method: 'Credit Card'
    },
    {
      id: 2,
      description: 'Library Fee',
      amount: 200,
      date: '2024-01-20',
      status: 'paid',
      method: 'Online Payment'
    },
    {
      id: 3,
      description: 'Lab Fee',
      amount: 500,
      date: '2024-02-10',
      status: 'pending'
    },
    {
      id: 4,
      description: 'Sports Fee',
      amount: 300,
      date: '2024-02-15',
      status: 'pending'
    }
  ])

  const totalFees = payments.reduce((sum, p) => sum + p.amount, 0)
  const paidFees = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
  const pendingFees = totalFees - paidFees

  const paidPayments = payments.filter(p => p.status === 'paid')
  const pendingPayments = payments.filter(p => p.status === 'pending')

  return (
    <div className="min-h-screen p-8 max-w-[1400px] mx-auto">
      <header className="flex items-center gap-6 mb-8">
        <button onClick={() => router.back()} className="py-3 px-6 rounded-[12px] bg-[var(--card-bg)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.1)] text-[var(--text)] font-medium cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--primary)]">← Back</button>
        <h1 className="text-[2rem] font-bold text-[var(--text)]">💳 Fee Payment</h1>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <h3 className="text-sm font-medium text-[var(--muted)] mb-2">Total Fees</h3>
          <p className="text-3xl font-bold m-0" style={{ color: 'var(--primary)' }}>₹{totalFees.toFixed(2)}</p>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid #10b981' }}>
          <h3 className="text-sm font-medium text-[var(--muted)] mb-2">Paid</h3>
          <p className="text-3xl font-bold m-0" style={{ color: '#10b981' }}>₹{paidFees.toFixed(2)}</p>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <h3 className="text-sm font-medium text-[var(--muted)] mb-2">Pending</h3>
          <p className="text-3xl font-bold m-0" style={{ color: '#ef4444' }}>₹{pendingFees.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Pending Payments */}
        {pendingPayments.length > 0 && (
          <section className="w-full">
            <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">Pending Payments</h2>
            <div className="flex flex-col gap-4">
              {pendingPayments.map(payment => (
                <div key={payment.id} className="glass-card">
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--text)] mb-1">{payment.description}</h3>
                      <p className="text-[var(--muted)] text-sm">Due: {new Date(payment.date).toLocaleDateString()}</p>
                    </div>
                    <span className="py-[0.375rem] px-[0.875rem] rounded-[20px] text-xs font-semibold text-white whitespace-nowrap" style={{ background: '#f59e0b' }}>Pending</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-[rgba(255,255,255,0.1)]">
                    <p className="text-2xl font-bold text-[var(--primary)] m-0">₹{payment.amount.toFixed(2)}</p>
                    <button className="py-3 px-6 rounded-[12px] bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg border-none cursor-pointer">Pay Now</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Payment History */}
        <section className="w-full">
          <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">Payment History</h2>
          {paidPayments.length === 0 ? (
            <div className="glass-card">
              <p className="text-center text-[var(--muted)] p-8">No payment history yet</p>
            </div>
          ) : (
            <div className="glass-card">
              <div className="overflow-x-auto">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 p-4 font-semibold text-[var(--text)] border-b border-[rgba(255,255,255,0.1)] min-w-[600px]">
                  <div>Description</div>
                  <div>Date</div>
                  <div>Method</div>
                  <div>Amount</div>
                  <div>Status</div>
                </div>
                {paidPayments.map(payment => (
                  <div key={payment.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 p-4 border-b border-[rgba(255,255,255,0.1)] last:border-b-0 text-[var(--text)] min-w-[600px]">
                    <div>{payment.description}</div>
                    <div>{new Date(payment.date).toLocaleDateString()}</div>
                    <div>{payment.method}</div>
                    <div className="font-semibold text-[var(--primary)]">₹{payment.amount.toFixed(2)}</div>
                    <div>
                      <span className="py-[0.375rem] px-[0.875rem] rounded-[20px] text-xs font-semibold text-white whitespace-nowrap" style={{ background: '#10b981' }}>Paid</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
