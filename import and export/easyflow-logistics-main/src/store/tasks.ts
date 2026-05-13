import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Priority = "urgent" | "medium" | "low";
export type TaskStatus = "pending" | "acknowledged" | "completed";

export interface Employee {
  id: string;
  name: string;
  role: string;
  avatarSeed: number;
}

export interface Task {
  id: string;
  ref: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  assigneeId: string | "all";
  createdAt: number;
  dueDate?: string;
  createdBy: string;
}

// Loading & Quality Check List report
export type Rating3 = "fair" | "good" | "excellent";
export type Caliper = "fair" | "fit" | "perfect";
export type StampedT = "stamped" | "not_stamped";
export type PalletNew = "new" | "used";
export type PalletStrength = "fair" | "strong" | "excellent";
export type FittingT = "strong" | "not_strong";
export type YesNo = "yes" | "no";

export interface InspectionReport {
  id: string;
  jobNumber: string;
  date: string;
  supervisor: string;
  arrivalTime: string;
  departureTime: string;
  stationName: string;
  stationManager: string;
  orderSummary: string;

  productQuality?: Rating3;
  productQualityNotes: string;

  caliper?: Caliper;
  caliperNotes: string;

  washing?: Rating3;
  washingNotes: string;

  packingMaterial?: Rating3;
  packingMaterialNotes: string;

  temperatureTreatment?: Rating3;
  temperatureC: string;
  temperatureNotes: string;

  packingWeightSize?: Rating3;
  packingWeightSizeNotes: string;

  palletsCheck?: StampedT;
  palletsCheckNotes: string;

  palletsConditionType?: PalletNew;
  palletsConditionStrength?: PalletStrength;
  palletsConditionNotes: string;

  palletsPreparedWeight: string;
  palletsPreparedWrapping?: YesNo;
  palletsPreparedNotes: string;

  fitting?: FittingT;
  fittingNotes: string;

  storageCondition: string;

  loadingStart: string;
  loadingEnd: string;

  containerWashed?: YesNo;
  containerWashedNotes: string;

  testingTempCondition: string;
  finalLoadingDetails: string;

  inspectorName: string;
  signature: string;

  submittedAt: number;
  submittedById: string;
}

interface Store {
  tasks: Task[];
  employees: Employee[];
  reports: InspectionReport[];
  currentEmployeeId: string;
  setCurrentEmployeeId: (id: string) => void;
  addTask: (t: Omit<Task, "id" | "ref" | "createdAt" | "status" | "createdBy">) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  addEmployee: (e: Omit<Employee, "id" | "avatarSeed">) => void;
  removeEmployee: (id: string) => void;
  addReport: (r: Omit<InspectionReport, "id" | "submittedAt">) => void;
  deleteReport: (id: string) => void;
}

const Ctx = createContext<Store | null>(null);
const STORAGE = "me.store.v2";

const seedEmployees: Employee[] = [
  { id: "e1", name: "Marcus Thorne", role: "Logistics Officer", avatarSeed: 12 },
  { id: "e2", name: "Layla Haddad", role: "Customs Specialist", avatarSeed: 24 },
  { id: "e3", name: "Samir Gupta", role: "Warehouse Lead", avatarSeed: 35 },
  { id: "e4", name: "Elena Rossi", role: "Freight Coordinator", avatarSeed: 47 },
];

const seedTasks: Task[] = [
  {
    id: "t1",
    ref: "LHR-0922",
    title: "Expedite clearance for medical parcel 4421-B",
    description:
      "Ensure cold-chain documentation is signed by the duty officer before 14:00. Photograph all seals.",
    priority: "urgent",
    status: "pending",
    assigneeId: "e2",
    createdAt: 0,
    createdBy: "Admin",
  },
  {
    id: "t2",
    ref: "HKG-8812",
    title: "Verify container seal mismatch — vessel Orion",
    description: "Photographic evidence required for insurance waiver before crane assignment.",
    priority: "medium",
    status: "acknowledged",
    assigneeId: "e1",
    createdAt: 0,
    createdBy: "Admin",
  },
  {
    id: "t3",
    ref: "DXB-1002",
    title: "Shift manifest verification — Night Crew",
    description: "Final reconciliation of bills of lading for the Mediterranean route.",
    priority: "low",
    status: "completed",
    assigneeId: "e3",
    createdAt: 0,
    createdBy: "Admin",
  },
  {
    id: "t4",
    ref: "RTM-4471",
    title: "Daily inventory snapshot — Warehouse C-4",
    description: "Submit pallet count and damaged-goods report by end of shift.",
    priority: "medium",
    status: "pending",
    assigneeId: "all",
    createdAt: 0,
    createdBy: "Admin",
  },
];

interface Persisted {
  tasks: Task[];
  employees: Employee[];
  reports: InspectionReport[];
  currentEmployeeId: string;
}

function load(): Persisted {
  const fallback: Persisted = {
    tasks: seedTasks,
    employees: seedEmployees,
    reports: [],
    currentEmployeeId: "e1",
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Persisted>;
      return {
        tasks: parsed.tasks ?? seedTasks,
        employees: parsed.employees ?? seedEmployees,
        reports: parsed.reports ?? [],
        currentEmployeeId: parsed.currentEmployeeId ?? "e1",
      };
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

function save(p: Persisted) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE, JSON.stringify(p));
}

function genRef(): string {
  const codes = ["LHR", "HKG", "DXB", "RTM", "SGP", "JED", "NYC"];
  const code = codes[Math.floor(Math.random() * codes.length)];
  const num = Math.floor(1000 + Math.random() * 8999);
  return `${code}-${num}`;
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(() => ({
    tasks: seedTasks,
    employees: seedEmployees,
    reports: [],
    currentEmployeeId: "e1",
  }));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = load();
    // Backfill seed createdAt values relative to now
    const offsets = [14 * 60_000, 2 * 60 * 60_000, 4 * 60 * 60_000, 30 * 60_000];
    const now = Date.now();
    loaded.tasks = loaded.tasks.map((t, i) =>
      t.createdAt === 0 ? { ...t, createdAt: now - (offsets[i] ?? 60_000) } : t,
    );
    setState(loaded);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) save(state);
  }, [state, hydrated]);

  const addTask: Store["addTask"] = useCallback((t) => {
    setState((s) => ({
      ...s,
      tasks: [
        {
          ...t,
          id: crypto.randomUUID(),
          ref: genRef(),
          createdAt: Date.now(),
          status: "pending",
          createdBy: "Admin",
        },
        ...s.tasks,
      ],
    }));
  }, []);

  const updateTaskStatus: Store["updateTaskStatus"] = useCallback((id, status) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    }));
  }, []);

  const deleteTask: Store["deleteTask"] = useCallback((id) => {
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
  }, []);

  const addEmployee: Store["addEmployee"] = useCallback((e) => {
    setState((s) => ({
      ...s,
      employees: [
        ...s.employees,
        { ...e, id: crypto.randomUUID(), avatarSeed: Math.floor(Math.random() * 100) },
      ],
    }));
  }, []);

  const removeEmployee: Store["removeEmployee"] = useCallback((id) => {
    setState((s) => ({ ...s, employees: s.employees.filter((e) => e.id !== id) }));
  }, []);

  const addReport: Store["addReport"] = useCallback((r) => {
    setState((s) => ({
      ...s,
      reports: [{ ...r, id: crypto.randomUUID(), submittedAt: Date.now() }, ...s.reports],
    }));
  }, []);

  const deleteReport: Store["deleteReport"] = useCallback((id) => {
    setState((s) => ({ ...s, reports: s.reports.filter((r) => r.id !== id) }));
  }, []);

  const setCurrentEmployeeId: Store["setCurrentEmployeeId"] = useCallback(
    (currentEmployeeId) => setState((s) => ({ ...s, currentEmployeeId })),
    [],
  );

  const value = useMemo<Store>(
    () => ({
      ...state,
      setCurrentEmployeeId,
      addTask,
      updateTaskStatus,
      deleteTask,
      addEmployee,
      removeEmployee,
      addReport,
      deleteReport,
    }),
    [
      state,
      setCurrentEmployeeId,
      addTask,
      updateTaskStatus,
      deleteTask,
      addEmployee,
      removeEmployee,
      addReport,
      deleteReport,
    ],
  );

  return createElement(Ctx.Provider, { value }, children);
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within TaskProvider");
  return ctx;
}
