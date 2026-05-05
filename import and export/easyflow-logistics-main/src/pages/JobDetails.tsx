import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios'; // استيراد axios للاتصال بالباك-إند
import { formatCurrency, formatDate } from '@/data/store';
import { AccountStatement } from '@/components/AccountStatement';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/PageHeader';
import { FileViewer } from '@/components/FileViewer';
import { Loader2, ArrowLeft, Briefcase, Users, Ship, Calendar, Wheat, DollarSign, FileText } from 'lucide-react';

const statusColors: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  completed: 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // حالات جلب البيانات
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [txTrigger, setTxTrigger] = useState(0);
  const [viewingFile, setViewingFile] = useState<string | null>(null);

  // 1. جلب البيانات من السيرفر
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true);
        // تأكد أن الرابط يطابق الـ API في server.js
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

    fetchJobData();
  }, [id, txTrigger]); // يعيد الجلب عند تغيير الـ ID أو عند تحديث المعاملات

  // 2. الحسابات المالية (تستخدم البيانات القادمة من السيرفر)
  const financialSummary = useMemo(() => {
    if (!job) return null;

    const transactions = job.transactions || [];
    
    const sumByCurr = (filterFn: (t: any) => boolean, mapFn: (t: any) => number = t => t.amount) => {
      return transactions.filter(filterFn).reduce((acc: any, t: any) => {
        const c = t.currency || job.currency;
        acc[c] = (acc[c] || 0) + mapFn(t);
        return acc;
      }, {} as Record<string, number>);
    };

    const mergeCurr = (...objs: Record<string, number>[]) => {
      const res: Record<string, number> = {};
      objs.forEach(o => {
        Object.entries(o).forEach(([c, v]) => {
          if(v !== 0) res[c] = (res[c] || 0) + v;
        });
      });
      return res;
    };
    

    // الحسابات
    const txIncomingObj = sumByCurr(t => t.type === 'incoming');
    const txOutgoingObj = sumByCurr(t => t.type === 'outgoing');
    const txPettyCashObj = sumByCurr(t => t.type === 'petty_cash');
    const txRawMatObj = sumByCurr(t => t.type === 'raw_material');
    const txOtherCostObj = sumByCurr(t => t.type === 'raw_material', t => Number(t.otherCost) || 0);
    const txDiscountObj = sumByCurr(t => t.type === 'discount');

    const grossRawMatCost = job.rawMaterialCost || 0;
    const netRawMatCost = grossRawMatCost - (grossRawMatCost * ((job.supplierDiscountPercentage || 0) / 100));
    
    const jobProductsValuationObjGross = job.products?.length > 0
      ? job.products.reduce((acc: any, p: any) => {
          const c = p.currency || job.currency;
          acc[c] = (acc[c] || 0) + ((Number(p.quantity) || 0) * (Number(p.unitPrice) || 0));
          return acc;
        }, {} as Record<string, number>)
      : { [job.currency]: job.totalPrice || 0 };

    const jobProductsValuationObj = Object.fromEntries(
      Object.entries(jobProductsValuationObjGross).map(([c, v]: any) => [c, v * (1 - (job.discountPercentage || 0) / 100)])
    );

    const baseDiscountObj = Object.fromEntries(
      Object.entries(jobProductsValuationObjGross).map(([c, v]: any) => [c, v * ((job.discountPercentage || 0) / 100)])
    );

    const totalOtherCostsObj = mergeCurr({ [job.currency]: job.pettyCash || 0 }, txPettyCashObj, txOtherCostObj);
    const totalRawMatObj = mergeCurr({ [job.currency]: netRawMatCost }, txRawMatObj);
    const totalDiscountObj = mergeCurr(baseDiscountObj, txDiscountObj);
    
    return {
      txIncomingObj,
      txOutgoingObj,
      jobProductsValuationObj,
      totalAccumulatedObj: mergeCurr(totalOtherCostsObj, totalRawMatObj, totalDiscountObj),
      totalSupplierOtherObj: mergeCurr(totalOtherCostsObj, totalRawMatObj),
      netRawMatCost
    };
  }, [job]);

  // Helper functions
  const formatMulti = (obj: Record<string, number>) => {
    const parts = Object.entries(obj).filter(([_,v]) => v !== 0).map(([c, v]) => formatCurrency(v, c));
    return parts.length ? parts.join(' | ') : formatCurrency(0, job?.currency || 'USD');
  };
  
  const isMultiZero = (obj: Record<string, number>) => Object.values(obj).every(v => v === 0);

  // واجهة التحميل
  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  
  // واجهة الخطأ
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
        <PageHeader title={job.title} description={`Type: ${job.operationType?.toUpperCase()} | Ledger & Details`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Operation Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/> Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Current Status:</span>
               <Badge variant="outline" className={(job?.status && statusColors[job.status]) || ''}>
  {job?.status ? t(`status.${job.status}` as any, { defaultValue: job.status }) : '...'}
</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Created Date:</span>
                <span className="font-medium"><Calendar className="h-3 w-3 inline mr-1 text-muted-foreground"/>{formatDate(job.createdAt)}</span>
              </div>
              
              {/* جلب البيانات من العلاقات التي أعادها السيرفر */}
              {job.client && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Client:</span>
                  <span className="font-medium flex items-center"><Users className="h-3 w-3 mr-1 text-muted-foreground"/> {job.client.name}</span>
                </div>
              )}
              {job.supplier && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Supplier:</span>
                  <span className="font-medium flex items-center"><Users className="h-3 w-3 mr-1 text-muted-foreground"/> {job.supplier.name}</span>
                </div>
              )}
              {job.container && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Container:</span>
                  <span className="font-medium flex items-center"><Ship className="h-3 w-3 mr-1 text-muted-foreground"/> {job.container.containerNumber}</span>
                </div>
              )}
              
              {/* زر عرض المرفقات باستخدام رابط السيرفر */}
              {job.packingListUrl && (
                <div className="flex justify-between items-center text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Packing List:</span>
                  <button onClick={() => setViewingFile(`http://localhost:5000${job.packingListUrl}`)} className="text-primary hover:underline flex items-center gap-1 font-medium">
                    <FileText className="h-4 w-4" /> View
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* المالية */}
          {financialSummary && (
            <div className="bg-card border rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><DollarSign className="h-5 w-5 text-warning"/> Summary Aggregation</h3>
              <div className="bg-background p-3 rounded border font-mono space-y-2 text-sm">
                <div className="flex justify-between font-bold text-lg pb-2 border-b">
                  <span>Valuation:</span> 
                  <span>{formatMulti(financialSummary.jobProductsValuationObj)}</span>
                </div>
                {!isMultiZero(financialSummary.txIncomingObj) && (
                   <div className="flex justify-between text-success text-xs pt-1">
                    <span>Incoming:</span> <span>{formatMulti(financialSummary.txIncomingObj)}</span>
                   </div>
                )}
                <div className="flex justify-between text-destructive text-sm font-bold pt-2 border-t border-dashed">
                  <span>Total Costs:</span>
                  <span>{formatMulti(financialSummary.totalSupplierOtherObj)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Ledger */}
        <div className="lg:col-span-2">
          <div className="bg-card border rounded-xl p-6 shadow-sm min-h-full">
            <h2 className="text-xl font-bold mb-2 text-foreground">Operation Ledger</h2>
            <AccountStatement 
              entityId={job.id} 
              entityType="job" 
              entityName={job.title} 
              // عند إضافة معاملة جديدة، نقوم بتغيير الـ trigger لإعادة جلب البيانات
              onUpdate={() => setTxTrigger(prev => prev + 1)}
            />
          </div>
        </div>
      </div>

      <FileViewer fileUrl={viewingFile} onClose={() => setViewingFile(null)} />
    </div>
  );
}
