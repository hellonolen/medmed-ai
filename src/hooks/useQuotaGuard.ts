/**
 * useQuotaGuard — Freemium 5-question limit with 48-hour reset.
 * Guests: localStorage. Signed-in: localStorage keyed by userId (server sync optional future).
 */

import { useState, useCallback } from 'react';

const FREE_LIMIT = 5;
const RESET_HOURS = 48;

interface QuotaData {
  count: number;
  firstAskedAt: number; // timestamp ms
  userId?: string;
}

function getStorageKey(userId?: string): string {
  return userId ? `mmq_${userId}` : 'mmq_guest';
}

function loadQuota(userId?: string): QuotaData {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return { count: 0, firstAskedAt: Date.now(), userId };
    const parsed: QuotaData = JSON.parse(raw);
    // Reset if 48 hours have passed since first question
    const hoursElapsed = (Date.now() - parsed.firstAskedAt) / 3_600_000;
    if (hoursElapsed >= RESET_HOURS) {
      return { count: 0, firstAskedAt: Date.now(), userId };
    }
    return parsed;
  } catch (_) {
    return { count: 0, firstAskedAt: Date.now(), userId };
  }
}

function saveQuota(data: QuotaData, userId?: string) {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(data));
  } catch (_) { /* storage unavailable */ }
}

export function useQuotaGuard(userId?: string) {
  const [quota, setQuota] = useState<QuotaData>(() => loadQuota(userId));
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const isPro = false; // TODO: wire to subscription context if needed

  const canAsk = isPro || quota.count < FREE_LIMIT;

  const recordQuestion = useCallback(() => {
    setQuota(prev => {
      const updated: QuotaData = {
        ...prev,
        count: prev.count + 1,
        firstAskedAt: prev.count === 0 ? Date.now() : prev.firstAskedAt,
      };
      saveQuota(updated, userId);
      return updated;
    });
  }, [userId]);

  const checkAndGate = useCallback((): boolean => {
    const current = loadQuota(userId);
    if (isPro || current.count < FREE_LIMIT) {
      return true; // Allow
    }
    setShowUpgradeModal(true);
    return false; // Block
  }, [userId, isPro]);

  const dismissUpgradeModal = useCallback(() => setShowUpgradeModal(false), []);

  return {
    canAsk,
    questionsUsed: quota.count,
    questionsRemaining: Math.max(0, FREE_LIMIT - quota.count),
    showUpgradeModal,
    checkAndGate,
    recordQuestion,
    dismissUpgradeModal,
  };
}
