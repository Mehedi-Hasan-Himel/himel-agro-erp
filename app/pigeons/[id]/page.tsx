"use client";

import React, { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pigeon } from "@/types/pigeon";
import { Pair, BreedingRound, HatchingStats } from "@/types/breeding";
import { FlyingRecord } from "@/types/flying";
import { HealthRecord } from "@/types/health";
import { PedigreeNodeData } from "@/types/pedigree";
import { PigeonProfileSkeleton } from "@/components/ui/Skeleton";

import {
  getPigeonById,
  getPigeonChildren,
  getPigeons,
  getActivePigeonSerialMap,
} from "@/lib/repositories/pigeonRepository";
import {
  getPairs,
  getPairsForPigeon,
  getActivePairForPigeon,
  getBreedingRoundsForPigeon,
  getPigeonHatchingStats,
  getActivePairSerialMap,
} from "@/lib/repositories/breedingRepository";
import { getFlyingRecords } from "@/lib/repositories/flyingRepository";
import { getHealthRecords } from "@/lib/repositories/healthRepository";
import { buildPedigreeTree } from "@/lib/pedigree/pedigreeBuilder";
import { formatRingNumber, formatCompactRing } from "@/lib/formatters/ringFormatter";
import { formatDate, calculateAge } from "@/lib/formatters/dateFormatter";
import { formatCurrency } from "@/lib/formatters/currencyFormatter";
import { DATA_CHANGE_EVENT } from "@/lib/repositories/storageAdapter";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { RingBadge } from "@/components/pigeons/RingBadge";
import { StatusBadge } from "@/components/pigeons/StatusBadge";
import { SexBadge } from "@/components/pigeons/SexBadge";
import { PedigreeTree } from "@/components/pedigree/PedigreeTree";
import { PedigreePDFModal } from "@/components/pedigree/PedigreePDFModal";
import { BreedingStatsCard } from "@/components/breeding/BreedingStatsCard";
import { SaleModal } from "@/components/pigeons/SaleModal";
import { DeathModal } from "@/components/pigeons/DeathModal";
import { DeletePigeonModal } from "@/components/pigeons/DeletePigeonModal";
import { PairFormModal } from "@/components/breeding/PairFormModal";
import { BreedingRoundModal } from "@/components/breeding/BreedingRoundModal";
import { PigeonGallery } from "@/components/pigeons/PigeonGallery";
import { PigeonVideoGallery } from "@/components/pigeons/PigeonVideoGallery";
import { PigeonFamilyRelationships } from "@/components/pigeons/PigeonFamilyRelationships";
import { PigeonInfoPDFModal } from "@/components/pedigree/PigeonInfoPDFModal";
import { calculateFamilyRelationships } from "@/lib/calculations/relationshipCalculator";
import { SquabIcon, CockPigeonIcon, HenPigeonIcon, TakaIcon } from "@/components/ui/icons";

import {
  Feather,
  GitFork,
  Heart,
  Trophy,
  HeartPulse,
  History,
  Edit,
  Download,
  ArrowLeft,
  Calendar,
  AlertTriangle,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Egg,
  Tag,
  Trash2,
  Users,
  Video,
} from "lucide-react";

export default function PigeonProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const pigeonId = resolvedParams.id;
  const router = useRouter();

  const [pigeon, setPigeon] = useState<Pigeon | null>(null);
  const [father, setFather] = useState<Pigeon | null>(null);
  const [mother, setMother] = useState<Pigeon | null>(null);
  const [childrenList, setChildrenList] = useState<Pigeon[]>([]);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [activeSerialMap, setActiveSerialMap] = useState<Map<string, string>>(new Map());
  const [activePair, setActivePair] = useState<Pair | null>(null);
  const [currentPartner, setCurrentPartner] = useState<Pigeon | null>(null);
  const [rounds, setRounds] = useState<BreedingRound[]>([]);
  const [hatchingStats, setHatchingStats] = useState<HatchingStats | null>(null);
  const [flyingRecords, setFlyingRecords] = useState<FlyingRecord[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [pedigreeTree, setPedigreeTree] = useState<PedigreeNodeData | null>(
    null
  );
  const [allPigeons, setAllPigeons] = useState<Pigeon[]>([]);

  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isInfoPdfModalOpen, setIsInfoPdfModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isDeathModalOpen, setIsDeathModalOpen] = useState(false);
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);
  const [isRoundModalOpen, setIsRoundModalOpen] = useState(false);
  const [selectedPairForRound, setSelectedPairForRound] = useState<Pair | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const familySummary = useMemo(() => {
    return pigeon ? calculateFamilyRelationships(pigeon, allPigeons) : null;
  }, [pigeon, allPigeons]);

  const activePigeonSerialMap = useMemo(() => {
    return getActivePigeonSerialMap(allPigeons);
  }, [allPigeons]);

  const activePigeonSerial = pigeon ? activePigeonSerialMap.get(pigeon.id) : undefined;

  const loadPigeonData = async () => {
    try {
      const p = await getPigeonById(pigeonId);
      if (!p) {
        setPigeon(null);
        setIsLoading(false);
        return;
      }
      if (p.id && p.id.toLowerCase() !== pigeonId.toLowerCase()) {
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", `/pigeons/${p.id}`);
        }
        router.replace(`/pigeons/${p.id}`);
        return;
      }
      setPigeon(p);

      const [
        allList,
        allFarmPairs,
        f,
        m,
        kids,
        pPairs,
        actPair,
        pRounds,
        hStats,
        flights,
        health,
        tree,
      ] = await Promise.all([
        getPigeons(),
        getPairs(),
        p.fatherId ? getPigeonById(p.fatherId) : null,
        p.motherId ? getPigeonById(p.motherId) : null,
        getPigeonChildren(p.id),
        getPairsForPigeon(p.id),
        getActivePairForPigeon(p.id),
        getBreedingRoundsForPigeon(p.id),
        getPigeonHatchingStats(p.id),
        getFlyingRecords(p.id),
        getHealthRecords(p.id),
        buildPedigreeTree(p.id, 3),
      ]);

      setAllPigeons(allList);
      setActiveSerialMap(getActivePairSerialMap(allFarmPairs));
      setFather(f);
      setMother(m);
      setChildrenList(kids);
      setPairs(pPairs);
      setActivePair(actPair);
      setRounds(pRounds);
      setHatchingStats(hStats);
      setFlyingRecords(flights);
      setHealthRecords(health);
      setPedigreeTree(tree);

      if (actPair) {
        const partnerId =
          actPair.maleId === p.id ? actPair.femaleId : actPair.maleId;
        const partnerPigeon = allList.find((item) => item.id === partnerId);
        setCurrentPartner(partnerPigeon || null);
      } else {
        setCurrentPartner(null);
      }
    } catch (err) {
      console.error("Error loading pigeon profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPigeonData();

    const handleDataChange = () => {
      loadPigeonData();
    };

    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    return () => {
      window.removeEventListener(DATA_CHANGE_EVENT, handleDataChange);
    };
  }, [pigeonId]);

  if (isLoading) {
    return <PigeonProfileSkeleton />;
  }

  if (!pigeon) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-2">
          Pigeon Not Found
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          No pigeon record exists with ID &quot;{pigeonId}&quot;.
        </p>
        <Button onClick={() => router.push("/pigeons")} variant="primary">
          Back to Pigeons Directory
        </Button>
      </div>
    );
  }

  const age = calculateAge(pigeon.birthDate || pigeon.hatchDate);

  const tabsConfig = [
    { id: "overview", label: "Overview", icon: Feather },
    {
      id: "family",
      label: "Family & Relationships",
      icon: Users,
      count: familySummary ? familySummary.totalRelationsCount : undefined,
    },
    {
      id: "breeding",
      label: "Breeding & Pairs",
      icon: Heart,
      count: rounds.length,
    },
    {
      id: "offspring",
      label: "Offspring (Children)",
      icon: SquabIcon,
      count: childrenList.length,
    },
    { id: "pedigree", label: "Pedigree Bloodline", icon: GitFork },
    {
      id: "flying",
      label: "Flying & Racing",
      icon: Trophy,
      count: flyingRecords.length,
    },
    {
      id: "health",
      label: "Health & Treatment",
      icon: HeartPulse,
      count: healthRecords.length,
    },
    { id: "financial", label: "Financial History", icon: TakaIcon },
    { id: "history", label: "Lifecycle Log", icon: History },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/pigeons"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Pigeon Directory
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono">
          {pigeon.status === "ACTIVE" && activePigeonSerial && (
            <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md shadow-2xs">
              Active #{activePigeonSerial}
            </span>
          )}
          <span className="text-slate-400 font-medium">ID: {pigeon.id}</span>
        </div>
      </div>

      {/* Top Identity Digital Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 relative">
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
          {/* Left: Avatar + Identification Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 flex-1 min-w-0">
            {/* Pigeon Photo */}
            {pigeon.photoUrl ? (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-xs shrink-0">
                <img
                  src={pigeon.photoUrl}
                  alt={pigeon.id}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Feather className="w-10 h-10 stroke-1" />
              </div>
            )}

            {/* Info Stack */}
            <div className="space-y-2.5 min-w-0 flex-1">
              {/* Row 1: Active Serial (if active) + ID Badge + Status + Sex */}
              <div className="flex flex-wrap items-center gap-2">
                {pigeon.status === "ACTIVE" && activePigeonSerial && (
                  <span
                    title={`Active Pigeon #${activePigeonSerial}`}
                    className="text-sm sm:text-base font-mono font-black text-white bg-emerald-600 px-2.5 py-0.5 rounded-lg shadow-2xs border border-emerald-700 leading-normal shrink-0"
                  >
                    #{activePigeonSerial}
                  </span>
                )}
                <span className="text-sm sm:text-base font-mono font-bold tracking-tight text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs leading-normal">
                  {pigeon.id}
                </span>
                <StatusBadge status={pigeon.status} size="md" />
                <SexBadge sex={pigeon.sex} />
              </div>

              {/* Row 2: Official Ring Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold bg-emerald-600 text-white px-2.5 py-1 rounded-lg shadow-2xs border border-emerald-700 max-w-full truncate"
                  title={formatRingNumber(pigeon)}
                >
                  <Tag className="w-3 h-3 text-emerald-200 shrink-0" />
                  <span className="truncate">{formatRingNumber(pigeon)}</span>
                </span>
              </div>

              {/* Row 3: Pigeon Name / Subtype Heading (H1) */}
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {pigeon.breedSubtype || (pigeon.breed === "Giribaz / Local" ? "Giribaz" : pigeon.breed)}
                </h1>
              </div>

              {/* Row 4: Breed & Hatch Date / Age Metadata */}
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600 font-medium">
                {pigeon.breedSubtype && (
                  <>
                    <span>
                      Breed:{" "}
                      <strong className="font-semibold text-slate-800">
                        {pigeon.breed === "Giribaz / Local" ? "Giribaz" : pigeon.breed}
                      </strong>
                    </span>
                    <span className="text-slate-300">•</span>
                  </>
                )}
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  Hatch Date:{" "}
                  <strong className="font-semibold text-slate-700">
                    {formatDate(pigeon.birthDate || pigeon.hatchDate)}
                  </strong>
                </span>
                <span className="text-slate-300">•</span>
                <span>
                  Age: <strong className="font-semibold text-slate-700">{age}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex flex-wrap items-center xl:justify-end gap-2 shrink-0 xl:max-w-md pt-1">
            <Link
              href={`/pigeons/${pigeon.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-2xs"
            >
              <Edit className="w-3.5 h-3.5" /> Edit Pigeon
            </Link>

            {pigeon.status === "ACTIVE" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsPairModalOpen(true)}
                  className="gap-1.5 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                >
                  <GitFork className="w-3.5 h-3.5" /> Form Pair
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsSaleModalOpen(true)}
                  className="gap-1.5 text-xs text-blue-700 border-blue-200 hover:bg-blue-50"
                >
                  <TakaIcon className="w-3.5 h-3.5" /> Record Sale
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsDeathModalOpen(true)}
                  className="gap-1.5 text-xs text-rose-600 hover:bg-rose-50"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Record Demise
                </Button>
              </>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsInfoPdfModalOpen(true)}
              className="gap-1.5 text-xs text-emerald-800 border-emerald-300 hover:bg-emerald-50 bg-emerald-50/40"
            >
              <Download className="w-3.5 h-3.5" /> Pigeon Info PDF
            </Button>

            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsPdfModalOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" /> Pedigree PDF
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(true)}
              className="gap-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200"
              title="Delete or Archive Pigeon"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs
        tabs={tabsConfig}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="bg-white rounded-2xl border border-slate-200 px-4 shadow-xs"
      />

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Identity & Lineage Summary */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Core Identification & Lineage</CardTitle>
                    <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                      Biological sire, dam, and active breeding mate assignments linked to this bird.
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Father */}
                    <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
                        <CockPigeonIcon className="w-3.5 h-3.5 text-sky-700" />
                        <span>Biological Father (Sire)</span>
                      </span>
                      {father ? (
                        <div>
                          <Link
                            href={`/pigeons/${father.id}`}
                            className="font-mono font-bold text-sm text-sky-900 hover:underline block"
                          >
                            {formatRingNumber(father)}
                          </Link>
                          <span className="text-xs text-slate-600">
                            {father.breedSubtype || father.breed} ({father.ringYear})
                          </span>
                        </div>
                      ) : pigeon.fatherDetails ? (
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-semibold text-sky-950 block">Foundation / Ancestor:</span>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white/80 p-2 rounded-lg border border-sky-200/60">
                            {pigeon.fatherDetails}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Unknown / Unregistered Sire
                        </span>
                      )}
                    </div>

                    {/* Mother */}
                    <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-pink-700 flex items-center gap-1.5">
                        <HenPigeonIcon className="w-3.5 h-3.5 text-pink-700" />
                        <span>Biological Mother (Dam)</span>
                      </span>
                      {mother ? (
                        <div>
                          <Link
                            href={`/pigeons/${mother.id}`}
                            className="font-mono font-bold text-sm text-pink-900 hover:underline block"
                          >
                            {formatRingNumber(mother)}
                          </Link>
                          <span className="text-xs text-slate-600">
                            {mother.breedSubtype || mother.breed} ({mother.ringYear})
                          </span>
                        </div>
                      ) : pigeon.motherDetails ? (
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-semibold text-pink-950 block">Foundation / Ancestor:</span>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white/80 p-2 rounded-lg border border-pink-200/60">
                            {pigeon.motherDetails}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Unknown / Unregistered Dam
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Current Pair Partner */}
                  <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>Current Active Pair & Partner</span>
                      </span>
                      {activePair && currentPartner ? (
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/pigeons/${currentPartner.id}`}
                              className="font-mono font-bold text-sm text-emerald-900 hover:underline"
                            >
                              {formatRingNumber(currentPartner)}
                            </Link>
                            <span className="text-xs text-slate-600">
                              {currentPartner.breedSubtype || currentPartner.breed} ({currentPartner.ringYear})
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 block mt-0.5">
                            Paired on {formatDate(activePair.startDate)} • {activePair.cageNumber ? `Cage: ${activePair.cageNumber}` : "Active Breeding Cage"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic block">
                          Not currently paired with any partner.
                        </span>
                      )}
                    </div>

                    <div className="shrink-0">
                      {pigeon.status === "ACTIVE" && !activePair && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsPairModalOpen(true)}
                          className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-100 gap-1.5"
                        >
                          <GitFork className="w-3.5 h-3.5" /> + Create Pair
                        </Button>
                      )}

                      {pigeon.status === "ACTIVE" && activePair && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPairForRound(activePair);
                            setIsRoundModalOpen(true);
                          }}
                          className="text-xs text-emerald-800 bg-white border-emerald-300 hover:bg-emerald-100/80 shadow-2xs gap-1.5"
                          title="Record Egg Laying Date or Hatching Round"
                        >
                          <Egg className="w-3.5 h-3.5 text-amber-500" />
                          + Add Round / Eggs
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Acquisition Details */}
                  <div className="pt-3 border-t border-slate-100 text-xs space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Pigeon Origin:</span>
                      <span className="font-semibold text-slate-800">
                        {pigeon.source === "BORN_HIMEL_AGRO"
                          ? "Born at Himel's Pet House"
                          : "Purchased / Acquired"}
                      </span>
                    </div>
                    {pigeon.source === "PURCHASED" && (
                      <>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-500">Purchase Date:</span>
                          <span className="font-semibold text-slate-800">
                            {formatDate(pigeon.purchaseDate)}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-500">Purchase Price:</span>
                          <span className="font-bold text-rose-600">
                            {formatCurrency(pigeon.purchasePrice || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-500">Seller / Source Loft:</span>
                          <span className="font-semibold text-slate-800">
                            {pigeon.seller || "N/A"}
                          </span>
                        </div>
                      </>
                    )}

                    {pigeon.status === "SOLD" && (
                      <>
                        <div className="flex justify-between py-1 border-b border-slate-50 bg-blue-50/60 p-2 rounded-lg">
                          <span className="text-blue-700 font-semibold">
                            Sold on {formatDate(pigeon.saleDate)}:
                          </span>
                          <span className="font-bold text-emerald-700">
                            +{formatCurrency(pigeon.salePrice || 0)} (Buyer: {pigeon.buyer})
                          </span>
                        </div>
                      </>
                    )}

                    {pigeon.status === "DEAD" && (
                      <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-xs">
                        <span className="font-bold block">
                          Deceased on {formatDate(pigeon.deathDate)}:
                        </span>
                        <span>{pigeon.deathReason}</span>
                      </div>
                    )}

                    {pigeon.firstFlyingDate && (
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">
                          First Flight / Release Date:
                        </span>
                        <span className="font-semibold text-slate-800">
                          {formatDate(pigeon.firstFlyingDate)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Description & Notes */}
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Physical Notes & Description</CardTitle>
                    <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                      Color patterns, eye ring traits, feather markings, and loft keeper observations.
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {pigeon.colorPattern && (
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                      <span className="text-slate-600 font-semibold">Feather Color / Pattern:</span>
                      <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                        {pigeon.colorPattern}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {pigeon.notes || "No additional physical notes recorded."}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Breeding Stats & Fast Links */}
            <div className="space-y-6">
              {hatchingStats && (
                <BreedingStatsCard
                  stats={hatchingStats}
                  title="Pigeon Breeding Output"
                  subtitle="All breeding rounds involving this bird"
                />
              )}

              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Quick Family Lineage</CardTitle>
                    <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                      High-level genealogy counts for direct offspring, historical pair bonds, and flights.
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Direct Offspring:</span>
                    <span className="font-bold text-slate-900">
                      {childrenList.length} children
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Historical Partners:</span>
                    <span className="font-bold text-slate-900">
                      {pairs.length} pairs
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Flights Recorded:</span>
                    <span className="font-bold text-slate-900">
                      {flyingRecords.length} records
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <Button
                      onClick={() => setActiveTab("pedigree")}
                      variant="outline"
                      className="w-full text-xs justify-center gap-1.5"
                    >
                      <GitFork className="w-3.5 h-3.5" /> View Interactive Bloodline Tree
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Family & Relationships System */}
          <PigeonFamilyRelationships pigeon={pigeon} allPigeons={allPigeons} />

          {/* Individual Photo Gallery Card with Live Image Submit Form */}
          <PigeonGallery
            pigeon={pigeon}
            onPigeonUpdated={(updated) => setPigeon(updated)}
          />

          {/* Dedicated Video Gallery Card with Live Video Submit Form */}
          <PigeonVideoGallery
            pigeon={pigeon}
            onPigeonUpdated={(updated) => setPigeon(updated)}
          />
        </div>
      )}

      {/* Dedicated Tab: Family & Relationships */}
      {activeTab === "family" && (
        <PigeonFamilyRelationships pigeon={pigeon} allPigeons={allPigeons} />
      )}

      {/* Tab 2: Breeding & Pairs */}
      {activeTab === "breeding" && (
        <div className="space-y-6">
          {hatchingStats && (
            <BreedingStatsCard
              stats={hatchingStats}
              title="Individual Breeding & Hatching Performance"
              subtitle={`Total dynamic statistics for ${formatCompactRing(pigeon)}`}
            />
          )}

          {/* Historical Pairs */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Historical Pair Relationships ({pairs.length})</CardTitle>
                <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                  Partnership history, box allocations, active clutches, and hatch success rates with each mate.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {pairs.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No pair history recorded for this pigeon yet.
                </p>
              ) : (
                pairs.map((pr) => {
                  const partnerId =
                    pr.maleId === pigeon.id ? pr.femaleId : pr.maleId;
                  const partner = allPigeons.find((item) => item.id === partnerId);
                  const pairRounds = rounds.filter((r) => r.pairId === pr.id);
                  const pairEggs = pairRounds.reduce(
                    (sum, r) => sum + (r.eggsLaid || 0),
                    0
                  );
                  const pairHatched = pairRounds.reduce(
                    (sum, r) => sum + (r.babiesHatched || 0),
                    0
                  );
                  const pairHatchRate =
                    pairEggs > 0 ? Math.round((pairHatched / pairEggs) * 100) : 0;

                  return (
                    <div
                      key={pr.id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                        <div className="flex items-center gap-2">
                          {pr.status === "ACTIVE" && (
                            <span
                              title={`Active Pair #${activeSerialMap.get(pr.id) || "--"}`}
                              className="inline-flex items-center justify-center min-w-[28px] px-1.5 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-xs font-black shadow-2xs shrink-0"
                            >
                              #{activeSerialMap.get(pr.id) || "--"}
                            </span>
                          )}
                          <span
                            className={`w-2 h-2 rounded-full ${
                              pr.status === "ACTIVE"
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />
                          <span className="font-mono font-bold text-xs text-slate-900">
                            Pair ID: {pr.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              pr.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {pr.status}
                          </span>
                          {pr.cageNumber && (
                            <span className="text-[10px] font-semibold bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-full">
                              Cage: {pr.cageNumber}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {formatDate(pr.startDate)} –{" "}
                          {pr.endDate ? formatDate(pr.endDate) : "Present"}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs flex-1">
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                              Partner Pigeon
                            </span>
                            {partner ? (
                              <Link
                                href={`/pigeons/${partner.id}`}
                                className="font-mono font-bold text-emerald-700 hover:underline block"
                              >
                                {formatCompactRing(partner)}
                              </Link>
                            ) : (
                              <span className="text-slate-400">{partnerId}</span>
                            )}
                            {partner && (
                              <span className="text-[11px] text-slate-500 block">
                                {partner.breedSubtype || partner.breed}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                              Breeding Output
                            </span>
                            <span className="font-bold text-slate-800 block">
                              {pairRounds.length} rounds • {pairEggs} eggs
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              {pairHatched} live squabs hatched
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                              Pair Hatch Rate
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 mt-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                              {pairHatchRate}% Success
                            </span>
                          </div>
                        </div>

                        {pr.status === "ACTIVE" && (
                          <div className="shrink-0 w-full sm:w-auto">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedPairForRound(pr);
                                setIsRoundModalOpen(true);
                              }}
                              className="w-full sm:w-auto text-xs py-1.5 px-3 text-emerald-800 bg-white border-emerald-300 hover:bg-emerald-50 gap-1.5 shadow-2xs justify-center"
                              title="Record Egg Laying Date or Hatching Round"
                            >
                              <Egg className="w-3.5 h-3.5 text-amber-500" /> + Add Round
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Offspring */}
      {activeTab === "offspring" && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Direct Biological Offspring ({childrenList.length})</CardTitle>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                Verified biological progeny hatched from this pigeon, with ring numbers and current status.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {childrenList.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No offspring registered for this pigeon yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {childrenList.map((kid) => (
                  <div
                    key={kid.id}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <RingBadge pigeon={kid} size="sm" />
                      <div className="font-semibold text-slate-800 mt-1">
                        {kid.breedSubtype || kid.breed}
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Hatched: {formatDate(kid.hatchDate)}
                      </span>
                    </div>

                    <div className="text-right space-y-1">
                      <StatusBadge status={kid.status} size="sm" />
                      <Link
                        href={`/pigeons/${kid.id}`}
                        className="block text-[11px] font-semibold text-emerald-700 hover:underline"
                      >
                        Profile →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Pedigree */}
      {activeTab === "pedigree" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Interactive Ancestry Bloodline Tree
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-generation genealogy tree mapping sires, dams, and foundational ancestral strains. Click any known ancestor to view their profile.
              </p>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsPdfModalOpen(true)}
              className="gap-1.5"
            >
              <Download className="w-4 h-4" /> Download Pedigree PDF
            </Button>
          </div>

          {pedigreeTree && <PedigreeTree tree={pedigreeTree} />}
        </div>
      )}

      {/* Tab 5: Flying Records */}
      {activeTab === "flying" && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Flight & Racing Performance ({flyingRecords.length})</CardTitle>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                Training release logs, tossing distances, air speeds, and endurance performance records.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {flyingRecords.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No flying logs recorded yet.
              </p>
            ) : (
              flyingRecords.map((f) => (
                <div
                  key={f.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start justify-between text-xs gap-4"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 text-sm">
                      {f.eventName || "Loft Training Flight"}
                    </span>
                    <p className="text-slate-600">{f.result}</p>
                    {f.weather && (
                      <p className="text-[11px] text-slate-400">
                        Weather: {f.weather}
                      </p>
                    )}
                    {f.notes && (
                      <p className="text-[11px] text-slate-500 italic">
                        &quot;{f.notes}&quot;
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-emerald-700 text-sm block">
                      {f.flightDurationMinutes
                        ? `${Math.floor(f.flightDurationMinutes / 60)}h ${f.flightDurationMinutes % 60}m`
                        : "N/A"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(f.date)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 6: Health */}
      {activeTab === "health" && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Health & Treatment Log ({healthRecords.length})</CardTitle>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                Individual clinical interventions, diagnosis records, prescribed medications, and recovery tracking.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {healthRecords.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No health treatments logged for this pigeon.
              </p>
            ) : (
              healthRecords.map((h) => (
                <div
                  key={h.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 text-sm">
                      {h.medicineName}
                    </h5>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {h.targetType === "FLOCK" ? "Flock Course" : "Individual"}
                    </span>
                  </div>
                  <p className="text-slate-600">
                    <strong>Dose:</strong> {h.dose || "Standard"} •{" "}
                    <strong>Purpose:</strong> {h.purpose || "General health"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Course: {formatDate(h.startDate)} – {formatDate(h.endDate)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 7: Financial */}
      {activeTab === "financial" && (
        <Card>
          <CardHeader>
            <CardTitle>Financial History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {pigeon.source === "PURCHASED" && (
              <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-700 block">
                    Acquisition / Purchase Cost
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    Purchased from {pigeon.seller || "Loft"} on{" "}
                    {formatDate(pigeon.purchaseDate)}
                  </span>
                </div>
                <span className="text-lg font-black text-rose-600 font-mono">
                  -{formatCurrency(pigeon.purchasePrice || 0)}
                </span>
              </div>
            )}

            {pigeon.status === "SOLD" && (
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                    Pigeon Sale Income
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    Sold to {pigeon.buyer || "Enthusiast"} on{" "}
                    {formatDate(pigeon.saleDate)}
                  </span>
                  {pigeon.saleReason && (
                    <span className="text-[11px] text-slate-500 block">
                      Reason: {pigeon.saleReason}
                    </span>
                  )}
                </div>
                <span className="text-lg font-black text-emerald-600 font-mono">
                  +{formatCurrency(pigeon.salePrice || 0)}
                </span>
              </div>
            )}

            {pigeon.source === "BORN_HIMEL_AGRO" && pigeon.status !== "SOLD" && (
              <p className="text-xs text-slate-400 text-center py-6">
                Born at Himel&apos;s Pet House loft. No external purchase or sale transaction.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 8: History & Lifecycle */}
      {activeTab === "history" && (
        <Card>
          <CardHeader>
            <CardTitle>Permanent Lifecycle Event Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="border-l-2 border-emerald-500 pl-4 space-y-4 ml-2">
              <div className="relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                <span className="font-bold text-slate-900 block">
                  Hatched & Identity Ring Tagged
                </span>
                <span className="text-[11px] text-slate-400">
                  {formatDate(pigeon.hatchDate)} • Ring: {formatRingNumber(pigeon)}
                </span>
              </div>

              {pigeon.firstFlyingDate && (
                <div className="relative">
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-sky-500 ring-4 ring-white" />
                  <span className="font-bold text-slate-900 block">
                    First Loft Training Flight
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {formatDate(pigeon.firstFlyingDate)}
                  </span>
                </div>
              )}

              {pigeon.saleDate && (
                <div className="relative">
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
                  <span className="font-bold text-blue-900 block">
                    Sold to {pigeon.buyer}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {formatDate(pigeon.saleDate)} • Price:{" "}
                    {formatCurrency(pigeon.salePrice || 0)}
                  </span>
                </div>
              )}

              {pigeon.deathDate && (
                <div className="relative">
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-white" />
                  <span className="font-bold text-rose-900 block">
                    Deceased (Preserved in ERP)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {formatDate(pigeon.deathDate)} • Cause: {pigeon.deathReason}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pedigree Certificate PDF Modal */}
      {isPdfModalOpen && pedigreeTree && (
        <PedigreePDFModal
          tree={pedigreeTree}
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
        />
      )}

      {/* Pigeon Info Comprehensive PDF Modal */}
      {isInfoPdfModalOpen && pigeon && (
        <PigeonInfoPDFModal
          pigeon={pigeon}
          father={father}
          mother={mother}
          familySummary={familySummary}
          hatchingStats={hatchingStats}
          flyingRecords={flyingRecords}
          healthRecords={healthRecords}
          isOpen={isInfoPdfModalOpen}
          onClose={() => setIsInfoPdfModalOpen(false)}
        />
      )}

      {/* Sale Modal */}
      {isSaleModalOpen && (
        <SaleModal
          pigeon={pigeon}
          isOpen={isSaleModalOpen}
          onClose={() => setIsSaleModalOpen(false)}
          onSuccess={(updated) => {
            setPigeon(updated);
            loadPigeonData();
          }}
        />
      )}

      {/* Death Modal */}
      {isDeathModalOpen && (
        <DeathModal
          pigeon={pigeon}
          isOpen={isDeathModalOpen}
          onClose={() => setIsDeathModalOpen(false)}
          onSuccess={(updated) => {
            setPigeon(updated);
            loadPigeonData();
          }}
        />
      )}

      {/* Pair Modal */}
      {isPairModalOpen && (
        <PairFormModal
          pigeons={allPigeons}
          isOpen={isPairModalOpen}
          onClose={() => setIsPairModalOpen(false)}
          onSuccess={() => loadPigeonData()}
          defaultMaleId={pigeon.sex === "MALE" ? pigeon.id : ""}
          defaultFemaleId={pigeon.sex === "FEMALE" ? pigeon.id : ""}
        />
      )}

      {/* Breeding Round Modal */}
      {isRoundModalOpen && selectedPairForRound && (
        <BreedingRoundModal
          pair={selectedPairForRound}
          activeSerial={activeSerialMap.get(selectedPairForRound.id)}
          isOpen={isRoundModalOpen}
          onClose={() => {
            setIsRoundModalOpen(false);
            setSelectedPairForRound(null);
          }}
          onSuccess={() => loadPigeonData()}
        />
      )}

      {/* Delete Pigeon Modal */}
      {isDeleteModalOpen && (
        <DeletePigeonModal
          pigeon={pigeon}
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDeleted={() => {
            setIsDeleteModalOpen(false);
            router.push("/pigeons");
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
