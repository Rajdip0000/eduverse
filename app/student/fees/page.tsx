'use client';

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { sessionAtom } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import styles from './fees.module.css';

interface FeeRecord {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  dueDate: string;
  applicableToAll: boolean;
  course: {
    id: string;
    name: string;
    code: string;
  } | null;
}

interface FeePayment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionId: string | null;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  feeStructure: {
    id: string;
    title: string;
  };
}

interface FeesData {
  feeRecords: FeeRecord[];
  payments: FeePayment[];
  totalDue: number;
  totalPaid: number;
  balance: number;
}

export default function StudentFeesPage() {
  const [{ data: session, isPending }] = useAtom(sessionAtom);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [feesData, setFeesData] = useState<FeesData | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/sign-in');
      return;
    }

    if (session?.user) {
      fetchFees();
    }
  }, [session, isPending]);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/student/fees');
      if (response.ok) {
        const data = await response.json();
        setFeesData(data);
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className={styles.container}>
        <Navbar />
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading fees information...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#10b981';
      case 'PENDING': return '#f59e0b';
      case 'FAILED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const isPastDue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Fee Management</h1>
          <p>View your fee structure and payment history</p>
        </div>

        {/* Summary Cards */}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <h3>Total Due</h3>
            <p className={styles.amount} style={{ color: '#ef4444' }}>
              {formatCurrency(feesData?.totalDue || 0)}
            </p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Total Paid</h3>
            <p className={styles.amount} style={{ color: '#10b981' }}>
              {formatCurrency(feesData?.totalPaid || 0)}
            </p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Balance</h3>
            <p className={styles.amount} style={{ 
              color: (feesData?.balance || 0) > 0 ? '#f59e0b' : '#10b981' 
            }}>
              {formatCurrency(feesData?.balance || 0)}
            </p>
          </div>
        </div>

        {/* Fee Structure */}
        <div className={styles.section}>
          <h2>Fee Structure</h2>
          {!feesData?.feeRecords || feesData.feeRecords.length === 0 ? (
            <div className={styles.empty}>
              <p>No fee records found</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Course</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {feesData.feeRecords.map(fee => (
                    <tr key={fee.id}>
                      <td>{fee.title}</td>
                      <td>{fee.description || '-'}</td>
                      <td>
                        {fee.applicableToAll ? (
                          <span className={styles.badge} style={{ backgroundColor: '#3b82f6' }}>
                            All Courses
                          </span>
                        ) : fee.course ? (
                          `${fee.course.name} (${fee.course.code})`
                        ) : '-'}
                      </td>
                      <td className={styles.amountCell}>{formatCurrency(fee.amount)}</td>
                      <td>
                        <span style={{ 
                          color: isPastDue(fee.dueDate) ? '#ef4444' : 'inherit' 
                        }}>
                          {formatDate(fee.dueDate)}
                        </span>
                      </td>
                      <td>
                        {isPastDue(fee.dueDate) ? (
                          <span className={styles.badge} style={{ backgroundColor: '#ef4444' }}>
                            Overdue
                          </span>
                        ) : (
                          <span className={styles.badge} style={{ backgroundColor: '#f59e0b' }}>
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className={styles.section}>
          <h2>Payment History</h2>
          {!feesData?.payments || feesData.payments.length === 0 ? (
            <div className={styles.empty}>
              <p>No payment history found</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Fee Title</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Transaction ID</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {feesData.payments.map(payment => (
                    <tr key={payment.id}>
                      <td>{formatDate(payment.paymentDate)}</td>
                      <td>{payment.feeStructure.title}</td>
                      <td className={styles.amountCell}>{formatCurrency(payment.amount)}</td>
                      <td className={styles.capitalize}>{payment.paymentMethod.toLowerCase()}</td>
                      <td>{payment.transactionId || '-'}</td>
                      <td>
                        <span 
                          className={styles.badge}
                          style={{ backgroundColor: getStatusColor(payment.status) }}
                        >
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
