"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { GoalView } from "@/services/goal.service";

import { GoalDetail } from "./goal-detail";
import { GoalForm } from "./goal-form";
import { GoalsDashboard } from "./goals-dashboard";

type Step = "dashboard" | "form" | "detail";

interface GoalsViewProps {
  goals: GoalView[];
  cdiBaseRate: number;
}

export function GoalsView({ goals, cdiBaseRate }: GoalsViewProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("dashboard");
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<GoalView | null>(null);

  const selectedGoal = goals.find((goal) => goal.id === selectedGoalId) ?? null;

  function handleSaved() {
    router.refresh();
    setStep(editingGoal ? "detail" : "dashboard");
    setEditingGoal(null);
  }

  function handleDeleted() {
    router.refresh();
    setStep("dashboard");
    setSelectedGoalId(null);
  }

  if (step === "form") {
    return (
      <GoalForm
        goal={editingGoal}
        cdiBaseRate={cdiBaseRate}
        onDone={handleSaved}
        onCancel={() => setStep(editingGoal ? "detail" : "dashboard")}
      />
    );
  }

  if (step === "detail" && selectedGoal) {
    return (
      <GoalDetail
        goal={selectedGoal}
        onBack={() => {
          setStep("dashboard");
          setSelectedGoalId(null);
        }}
        onEdit={() => {
          setEditingGoal(selectedGoal);
          setStep("form");
        }}
        onDeleted={handleDeleted}
      />
    );
  }

  return (
    <GoalsDashboard
      goals={goals}
      onOpenGoal={(id) => {
        setSelectedGoalId(id);
        setStep("detail");
      }}
      onNewGoal={() => {
        setEditingGoal(null);
        setStep("form");
      }}
      onDeleted={() => router.refresh()}
    />
  );
}
