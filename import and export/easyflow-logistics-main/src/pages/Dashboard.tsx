import { useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { Briefcase, Ship, Users, DollarSign, Archive, Wheat, Calendar, MapPin, Info, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enUS, ar } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { formatCurrency, formatBalanceObj } from '@/data/store';

const statusColors: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  completed: 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  loading: 'bg-warning/10 text-warning border-warning/20',
  'in-transit': 'bg-info/10 text-info border-info/20',
  arrived: 'bg-success/10 text-success border-success/20',
  cleared: 'bg-muted text-muted-foreground border-border',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // جلب البيانات من الباك إند (Materialized View Summary)
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:5000/api/dashboard/summary');
      return res.data;
    },
    refetchInterval: 1000 * 60, // تحديث كل دقيقة تلقائياً
  });

  const dateLocale = i18n.language === 'ar' ? ar : enUS;
  const formatDate = (dateStr: string) =>
    formatDistanceToNow(new Date(dateStr), {
      addSuffix: true,
      locale: dateLocale,
    });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
        <p className="text-muted-foreground animate-pulse">{t('common.loading')}</p>
      </div>
    );
  }

  // استخراج البيانات القادمة من الباك إند
  const stats = dashboard || {};
  const recentJobs = dashboard?.recentJobs || [];
  const activeShipments = dashboard?.activeShipments || [];

  return (
    <div>
      <PageHeader
        title={t('common.dashboard')}
        description={t('dashboard.welcome')}
        action={
          <Button onClick={() => navigate('/jobs')} size="lg">
            <Briefcase className="me-2 h-4 w-4" />
            {t('dashboard.viewAllJobs')}
          </Button>
        }
      />

      {/* بطاقات الإحصائيات المالية - القادمة من الـ SQL View */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Sales"
          value={formatBalanceObj(stats.totalSales || {})}
          icon={Briefcase}
          variant="success"
          description="Net Sales"
        />

        <StatCard
          title="Client Remaining"
          value={formatCurrency(stats.clientDebt || 0, 'USD')}
          icon={DollarSign}
          variant="warning"
          description="Outstanding receivables"
        />

        <StatCard
          title="Supplier Own"
          value={formatCurrency(stats.supplierCost || 0, 'USD')}
          icon={DollarSign}
          variant="warning"
          description="Total payables"
        />

        <StatCard
          title="Agent Remaining"
          value={formatCurrency(stats.agentCost || 0, 'USD')}
          icon={Ship}
          variant="info"
          description="Total agent expenses"
        />
      </div>

      {/* العدادات الرقمية - القادمة من الـ SQL Counts */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mb-8">
        <StatCard title={t('common.containers')} value={stats.stats?.activeContainers || 0} icon={Ship} variant="info" />
        <StatCard title={t('dashboard.cropsProducts')} value={stats.stats?.totalProducts || 0} icon={Wheat} variant="default" />
        <StatCard title={t('dashboard.payments')} value={stats.stats?.totalTransactions || 0} icon={DollarSign} variant="success" />
        <StatCard title={t('dashboard.documents')} value={0} icon={Archive} variant="warning" />
      </div>

      {/* أحدث العمليات - جاهزة من السيرفر */}
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-lg font-semibold text-foreground">
          {t('dashboard.recentJobs')}
        </h2>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>{i18n.language === 'ar' ? 'أحدث الصفقات.' : 'The most recent deals.'}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="space-y-3 mb-8">
        {recentJobs.map((job: any) => (
          <div
            key={job.id}
            className="rounded-xl bg-card p-4 card-shadow hover:card-shadow-hover transition-shadow cursor-pointer"
            onClick={() => navigate('/jobs')}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground text-sm">{job.title}</h3>
                  <Badge variant="outline" className={`text-xs ${statusColors[job.status]}`}>
                    {t(`status.${job.status}`)}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {job.client?.name || ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {formatDate(job.createdAt)}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-foreground">
                   {formatCurrency(job.totalPrice || 0, job.currency)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* الشحنات النشطة */}
      {activeShipments.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold text-foreground">{t('dashboard.activeShipments')}</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeShipments.map((c: any) => (
              <div
                key={c.id}
                className="rounded-xl bg-card p-4 card-shadow cursor-pointer hover:card-shadow-hover transition-shadow"
                onClick={() => navigate('/containers')}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Ship className="h-4 w-4 text-info" />
                  <span className="font-medium text-foreground text-sm">{c.containerNumber}</span>
                  <Badge variant="outline" className={`text-xs ${statusColors[c.status]}`}>
                    {t(`status.${c.status}`)}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground uppercase">
                   <MapPin className="h-3 w-3" /> {c.destinationPort}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}