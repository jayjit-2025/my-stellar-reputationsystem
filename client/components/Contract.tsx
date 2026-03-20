"use client";

import { useState, useCallback, useEffect } from "react";
import {
  createTopic,
  giveReputation,
  getReputation,
  getTopics,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ThumbsUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );
}

function ThumbsDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

// ── Method Signature ─────────────────────────────────────────

function MethodSignature({
  name,
  params,
  returns,
  color,
}: {
  name: string;
  params: string;
  returns?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
      <span style={{ color }} className="font-semibold">fn</span>
      <span className="text-white/70">{name}</span>
      <span className="text-white/20 text-xs">{params}</span>
      {returns && (
        <span className="ml-auto text-white/15 text-[10px]">{returns}</span>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────

type Tab = "give" | "check" | "create" | "topics";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("give");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // Give reputation state
  const [giveTo, setGiveTo] = useState("");
  const [giveTopic, setGiveTopic] = useState("");
  const [giveValue, setGiveValue] = useState<number>(1);
  const [isGiving, setIsGiving] = useState(false);

  // Check reputation state
  const [checkAddress, setCheckAddress] = useState("");
  const [checkTopic, setCheckTopic] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [reputationResult, setReputationResult] = useState<number | null>(null);

  // Create topic state
  const [newTopic, setNewTopic] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // View topics state
  const [topics, setTopics] = useState<string[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // Load topics on mount and when tab changes
  const loadTopics = useCallback(async () => {
    setIsLoadingTopics(true);
    try {
      const result = await getTopics(walletAddress || undefined);
      if (Array.isArray(result)) {
        setTopics(result);
      } else {
        setTopics([]);
      }
    } catch {
      setTopics([]);
    } finally {
      setIsLoadingTopics(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (activeTab === "topics") {
      loadTopics();
    }
  }, [activeTab, loadTopics]);

  // Load common topics when tab changes to give/check
  useEffect(() => {
    if (topics.length === 0) {
      loadTopics();
    }
  }, [activeTab, loadTopics, topics.length]);

  const handleGiveReputation = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!giveTo.trim()) return setError("Enter an address to rate");
    if (!giveTopic.trim()) return setError("Select or enter a topic");
    if (giveValue === 0) return setError("Enter a reputation value");

    // Validate Stellar address format (starts with G)
    if (!giveTo.trim().startsWith("G")) {
      return setError("Invalid Stellar address (must start with G)");
    }

    setError(null);
    setIsGiving(true);
    setTxStatus("Awaiting signature...");
    try {
      await giveReputation(walletAddress, giveTo.trim(), giveTopic.trim(), giveValue);
      setTxStatus("Reputation recorded on-chain!");
      setGiveTo("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsGiving(false);
    }
  }, [walletAddress, giveTo, giveTopic, giveValue]);

  const handleCheckReputation = useCallback(async () => {
    if (!checkAddress.trim()) return setError("Enter an address to check");
    if (!checkTopic.trim()) return setError("Select or enter a topic");

    // Validate Stellar address format
    if (!checkAddress.trim().startsWith("G")) {
      return setError("Invalid Stellar address (must start with G)");
    }

    setError(null);
    setIsChecking(true);
    setReputationResult(null);
    try {
      const result = await getReputation(checkAddress.trim(), checkTopic.trim(), walletAddress || undefined);
      if (result !== null && result !== undefined) {
        setReputationResult(Number(result));
      } else {
        setReputationResult(0);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsChecking(false);
    }
  }, [checkAddress, checkTopic, walletAddress]);

  const handleCreateTopic = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!newTopic.trim()) return setError("Enter a topic name");
    if (newTopic.trim().length > 50) return setError("Topic name too long (max 50 chars)");

    setError(null);
    setIsCreating(true);
    setTxStatus("Awaiting signature...");
    try {
      await createTopic(walletAddress, newTopic.trim());
      setTxStatus("Topic created on-chain!");
      setNewTopic("");
      loadTopics();
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsCreating(false);
    }
  }, [walletAddress, newTopic, loadTopics]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "give", label: "Give", icon: <ThumbsUpIcon />, color: "#34d399" },
    { key: "check", label: "Check", icon: <SearchIcon />, color: "#4fc3f7" },
    { key: "create", label: "Create", icon: <PlusIcon />, color: "#7c6cf0" },
    { key: "topics", label: "Topics", icon: <ListIcon />, color: "#fbbf24" },
  ];

  // Default topics for quick selection
  const defaultTopics = ["helpful", "reliable", "trustworthy", "quality", "professional"];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("on-chain") || txStatus.includes("created") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c6cf0]/20 to-[#fbbf24]/20 border border-white/[0.06]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#fbbf24]">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">Reputation System</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="info" className="text-[10px]">Permissionless</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); setReputationResult(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Give Reputation */}
            {activeTab === "give" && (
              <div className="space-y-5">
                <MethodSignature name="give_reputation" params="(to: Address, topic: String, value: i128)" color="#34d399" />
                <Input label="To Address" value={giveTo} onChange={(e) => setGiveTo(e.target.value)} placeholder="G..." />
                <Input label="Topic" value={giveTopic} onChange={(e) => setGiveTopic(e.target.value)} placeholder="e.g. helpful" />
                
                {/* Topic Quick Select */}
                <div className="flex flex-wrap gap-2">
                  {[...new Set([...defaultTopics, ...topics])].slice(0, 8).map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setGiveTopic(topic)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all active:scale-95",
                        giveTopic === topic
                          ? "border-[#34d399]/30 bg-[#34d399]/10 text-[#34d399]"
                          : "border-white/[0.06] bg-white/[0.02] text-white/35 hover:text-white/55 hover:border-white/[0.1]"
                      )}
                    >
                      {topic}
                    </button>
                  ))}
                </div>

                {/* Reputation Value */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">Value</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setGiveValue(1)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 rounded-xl border py-4 transition-all active:scale-95",
                        giveValue === 1
                          ? "border-[#34d399]/30 bg-[#34d399]/10 text-[#34d399]"
                          : "border-white/[0.06] bg-white/[0.02] text-white/35 hover:border-white/[0.1]"
                      )}
                    >
                      <ThumbsUpIcon />
                      <span className="font-semibold">+1</span>
                    </button>
                    <button
                      onClick={() => setGiveValue(-1)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 rounded-xl border py-4 transition-all active:scale-95",
                        giveValue === -1
                          ? "border-[#f87171]/30 bg-[#f87171]/10 text-[#f87171]"
                          : "border-white/[0.06] bg-white/[0.02] text-white/35 hover:border-white/[0.1]"
                      )}
                    >
                      <ThumbsDownIcon />
                      <span className="font-semibold">-1</span>
                    </button>
                    <button
                      onClick={() => setGiveValue(5)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 rounded-xl border py-4 transition-all active:scale-95",
                        giveValue === 5
                          ? "border-[#34d399]/30 bg-[#34d399]/10 text-[#34d399]"
                          : "border-white/[0.06] bg-white/[0.02] text-white/35 hover:border-white/[0.1]"
                      )}
                    >
                      <StarIcon />
                      <span className="font-semibold">+5</span>
                    </button>
                  </div>
                </div>

                {walletAddress ? (
                  <ShimmerButton onClick={handleGiveReputation} disabled={isGiving} shimmerColor="#34d399" className="w-full">
                    {isGiving ? <><SpinnerIcon /> Submitting...</> : <><ThumbsUpIcon /> Give Reputation</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#34d399]/20 bg-[#34d399]/[0.03] py-4 text-sm text-[#34d399]/60 hover:border-[#34d399]/30 hover:text-[#34d399]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to give reputation
                  </button>
                )}
              </div>
            )}

            {/* Check Reputation */}
            {activeTab === "check" && (
              <div className="space-y-5">
                <MethodSignature name="get_reputation" params="(target: Address, topic: String)" returns="-> i128" color="#4fc3f7" />
                <Input label="Address" value={checkAddress} onChange={(e) => setCheckAddress(e.target.value)} placeholder="G..." />
                <Input label="Topic" value={checkTopic} onChange={(e) => setCheckTopic(e.target.value)} placeholder="e.g. helpful" />

                {/* Topic Quick Select */}
                <div className="flex flex-wrap gap-2">
                  {[...new Set([...defaultTopics, ...topics])].slice(0, 8).map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setCheckTopic(topic)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all active:scale-95",
                        checkTopic === topic
                          ? "border-[#4fc3f7]/30 bg-[#4fc3f7]/10 text-[#4fc3f7]"
                          : "border-white/[0.06] bg-white/[0.02] text-white/35 hover:text-white/55 hover:border-white/[0.1]"
                      )}
                    >
                      {topic}
                    </button>
                  ))}
                </div>

                <ShimmerButton onClick={handleCheckReputation} disabled={isChecking} shimmerColor="#4fc3f7" className="w-full">
                  {isChecking ? <><SpinnerIcon /> Checking...</> : <><SearchIcon /> Check Reputation</>}
                </ShimmerButton>

                {reputationResult !== null && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-fade-in-up">
                    <div className="border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">Reputation Score</span>
                      <Badge variant={reputationResult > 0 ? "success" : reputationResult < 0 ? "warning" : "info"}>
                        {reputationResult > 0 ? "+" : ""}{reputationResult}
                      </Badge>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Address</span>
                        <span className="font-mono text-sm text-white/80">{truncate(checkAddress)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Topic</span>
                        <span className="font-mono text-sm text-white/80">{checkTopic}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Create Topic */}
            {activeTab === "create" && (
              <div className="space-y-5">
                <MethodSignature name="create_topic" params="(topic: String)" color="#7c6cf0" />
                <Input label="Topic Name" value={newTopic} onChange={(e) => setNewTopic(e.target.value)} placeholder="e.g. innovative" />
                <p className="text-[10px] text-white/25">Create new reputation categories. Topics can be anything that makes sense for your community.</p>

                {walletAddress ? (
                  <ShimmerButton onClick={handleCreateTopic} disabled={isCreating} shimmerColor="#7c6cf0" className="w-full">
                    {isCreating ? <><SpinnerIcon /> Creating...</> : <><PlusIcon /> Create Topic</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#7c6cf0]/20 bg-[#7c6cf0]/[0.03] py-4 text-sm text-[#7c6cf0]/60 hover:border-[#7c6cf0]/30 hover:text-[#7c6cf0]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to create topics
                  </button>
                )}
              </div>
            )}

            {/* View Topics */}
            {activeTab === "topics" && (
              <div className="space-y-5">
                <MethodSignature name="get_topics" params="()" returns="-> Vec<String>" color="#fbbf24" />
                
                {isLoadingTopics ? (
                  <div className="flex items-center justify-center py-8">
                    <SpinnerIcon />
                    <span className="ml-2 text-sm text-white/50">Loading topics...</span>
                  </div>
                ) : topics.length === 0 ? (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
                    <StarIcon />
                    <p className="text-sm text-white/40 mt-2">No topics yet</p>
                    <p className="text-[10px] text-white/25 mt-1">Create a topic to start building reputation</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[...new Set([...defaultTopics, ...topics])].map((topic, index) => (
                      <div
                        key={`${topic}-${index}`}
                        className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                      >
                        <span className="font-mono text-sm text-white/80">{topic}</span>
                        <span className="h-2 w-2 rounded-full bg-[#fbbf24]/50" />
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={loadTopics}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 text-sm text-white/40 hover:text-white/60 hover:border-white/[0.1] transition-all flex items-center justify-center gap-2"
                >
                  <SearchIcon />
                  Refresh Topics
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">Reputation System &middot; Soroban</p>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]/50" />
                <span className="font-mono text-[9px] text-white/15">Permissionless</span>
              </span>
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}
