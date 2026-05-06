import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { formatCurrency, formatDate } from '@/data/store';
import { AccountStatement } from '@/components/AccountStatement';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/PageHeader';
import { FileViewer } from '@/components/FileViewer';
import { Loader2, ArrowLeft, Briefcase, Users, Ship, Calendar, DollarSign, FileText } from 'lucide-react';

const statusColors: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  completed: 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [txTrigger, setTxTrigger] = useState(0);
  const [viewingFile, setViewingFile] = useState<string | null>(null);

  // 1. جلب البيانات من السيرفر (تأكد من أن السيرفر يعيد financialSummary)
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true);
        // PostgreSQL IDs are numbers, but useParams returns strings
        const response = await axios.get(`http://localhost:5000/api/jobs/${id}`);
        setJob(response.data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching job details:", err);
        setError("Could not load operation details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchJobData();
  }, [id, txTrigger]);

  // دالة مساعدة لعرض المبالغ المتعددة (للشحن مثلاً)
  const formatShipping = (summary: any) => {
    if (!summary) return formatCurrency(0, job?.currency || 'USD');
    const parts = [];
    if (summary.egp > 0) parts.push(formatCurrency(summary.egp, 'EGP'));
    if (summary.usd > 0) parts.push(formatCurrency(summary.usd, 'USD'));
    if (summary.euro > 0) parts.push(formatCurrency(summary.euro, 'EUR'));
    return parts.length ? parts.join(' | ') : formatCurrency(0, job?.currency || 'USD');
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  
  if (error || !job) return (
    <div className="p-12 text-center text-muted-foreground">
      {error || "Operation not found."}
      <br />
      <Button variant="link" onClick={() => navigate('/jobs')}>Go back</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="outline" size="icon" onClick={() => navigate('/jobs')}><ArrowLeft className="h-4 w-4" /></Button>
        <PageHeader title={job.title} description={`Job No: ${job.jobNumber} | ${job.operationType?.toUpperCase()}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* العمود الأيسر: معلومات الحالة والمالية */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/> Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="outline" className={statusColors[job.status] || ''}>
                  {t(`status.${job.status}`, { defaultValue: job.status })}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium"><Calendar className="h-3 w-3 inline mr-1"/>{formatDate(job.createdAt)}</span>
              </div>
              
              {job.client && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Client:</span>
                  <span className="font-medium">{job.client.name}</span>
                </div>
              )}
              {job.supplier && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Supplier:</span>
                  <span className="font-medium">{job.supplier.name}</span>
                </div>
              )}

              {job.pdfUrl && (
                <div className="flex justify-between items-center text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Document:</span>
                  <button onClick={() => setViewingFile(`http://localhost:5000${job.pdfUrl}`)} className="text-primary hover:underline flex items-center gap-1 font-medium">
                    <FileText className="h-4 w-4" /> View File
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* استخدام الحسابات المالية الجاهزة من السيرفر */}
          {job.financialSummary && (
            <div className="bg-card border rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><DollarSign className="h-5 w-5 text-warning"/> Financial Summary</h3>
              <div className="bg-background p-3 rounded border font-mono space-y-3 text-sm">
                <div className="flex justify-between font-bold text-lg pb-2 border-b">
                  <span>Net Total:</span> 
                  <span className="text-primary">{formatCurrency(job.financialSummary.netTotal, job.currency)}</span>
                </div>
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Products:</span>
                        <span>{formatCurrency(job.financialSummary.productsTotal, job.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Raw Materials:</span>
                        <span>{formatCurrency(job.financialSummary.rawMaterialsTotal, job.currency)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-dashed">
                        <span className="text-muted-foreground">Shipping Costs:</span>
                        <span className="text-destructive font-medium">{formatShipping(job.financialSummary.shippingSummary)}</span>
                    </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* العمود الأيمن: كشف الحساب */}
        <div className="lg:col-span-2">
          <div className="bg-card border rounded-xl p-6 shadow-sm min-h-full">
            <h2 className="text-xl font-bold mb-4 text-foreground">Operation Ledger</h2>
            <AccountStatement 
              entityId={Number(job.id)} // تحويل لـ Number لضمان التوافق مع Postgres
              entityType="job" 
              entityName={job.title} 
              onUpdate={() => setTxTrigger(prev => prev + 1)}
            />
          </div>
        </div>
      </div>

      <FileViewer fileUrl={viewingFile} onClose={() => setViewingFile(null)} />
    </div>
  );
}